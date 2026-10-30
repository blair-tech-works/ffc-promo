/**
 * Build and push the deployed image from this machine, the way the Action does.
 *
 * `.github/workflows/release.yml` remains the normal path: merge to main, it
 * bumps the version, builds the image, Flux sees the new tag and rolls it out.
 * This is the same thing by hand, for when that path is not available —
 * Actions minutes exhausted, a billing block, GitHub down, or wanting to ship
 * a fix without waiting for a runner.
 *
 * Usage:
 *   npm run release              bump the patch version, build and push
 *   npm run release -- --dry-run print what it would do and stop
 *   npm run release -- --no-bump use the version already in package.json
 *   npm run release -- --tag X   push as :X instead of a version, and do not
 *                                touch git. Flux matches semver only, so a
 *                                non-semver tag lands in the registry without
 *                                deploying anything — which is how to prove a
 *                                build from a new machine before trusting it.
 */
import { execFileSync, execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const dryRun = has("--dry-run");
const customTag = args.includes("--tag") ? args[args.indexOf("--tag") + 1] : null;
if (args.includes("--tag") && !customTag) { console.error("--tag needs a value"); process.exit(1); }

const REGISTRY = "us-west1-docker.pkg.dev";
const PROJECT = "sandbox-438722";
const AR_REPO = "apps";
const PLATFORM = "linux/amd64";

function imageName() {
  const yml = readFileSync(path.join(root, ".github/workflows/release.yml"), "utf8");
  const m = /image-name:\s*(.+)/.exec(yml);
  if (!m) { die("Cannot find image-name in release.yml"); }
  return m[1].trim();
}

function run(cmd, argv, opts = {}) {
  console.log(`\n$ ${cmd} ${argv.join(" ")}\n`);
  if (dryRun) { return; }
  execFileSync(cmd, argv, { stdio: "inherit", cwd: root, ...opts });
}

function runWithRetry(cmd, argv, tries = 3) {
  for (let attempt = 1; ; attempt++) {
    try { return run(cmd, argv); }
    catch (e) {
      if (attempt >= tries) { throw e; }
      console.error(`\n  push failed (attempt ${attempt}/${tries}). Refreshing the `
                    + `registry token and retrying.\n`);
      try {
        execFileSync("gcloud",
          ["auth", "configure-docker", "us-west1-docker.pkg.dev", "--quiet"],
          { stdio: "ignore", cwd: root });
      } catch { /* the retry is worth having even without it */ }
    }
  }
}

const capture = (cmd) => execSync(cmd, { cwd: root, encoding: "utf8" }).trim();
function die(msg) { console.error(`\n${msg}\n`); process.exit(1); }

// ---------------------------------------------------------------- preflight
const IMAGE = imageName();
console.log(`Release — building ${IMAGE} from this machine.\n`);

try { execFileSync("docker", ["info"], { stdio: "ignore" }); }
catch { die("Docker is not running."); }

const account = capture("gcloud config get-value account 2>/dev/null");
if (!account || account === "(unset)") {
  die("No gcloud account. Run: gcloud auth login");
}
const dockerCfg = path.join(process.env.HOME ?? "", ".docker/config.json");
if (!readFileSync(dockerCfg, "utf8").includes(REGISTRY)) {
  die(`Docker is not configured to push to ${REGISTRY}.\n`
    + `Run: gcloud auth configure-docker ${REGISTRY}`);
}

const branch = capture("git rev-parse --abbrev-ref HEAD");
const dirty = capture("git status --porcelain");
if (dirty) {
  die("Working tree is not clean. The image would not match any commit:\n" + dirty);
}
if (branch !== "main") {
  console.warn(`  ! on '${branch}', not main — this ships whatever is here.`);
}
execFileSync("git", ["fetch", "-q", "origin"], { cwd: root });
const behind = capture("git rev-list --count HEAD..origin/main");
if (behind !== "0") {
  die(`${behind} commit(s) on origin/main are not in this tree. Pull first, or you `
    + `will ship an image that is missing them.`);
}

// ------------------------------------------------------------------ version
const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
let version = pkg.version;

if (customTag) {
  console.log(`  tagging as :${customTag} — no version bump, no git changes`);
} else if (!has("--no-bump")) {
  const [maj, min, pat] = version.split(".").map(Number);
  version = `${maj}.${min}.${pat + 1}`;
  console.log(`  version ${pkg.version} -> ${version}`);
  if (!dryRun) {
    pkg.version = version;
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    run("git", ["commit", "-am", `ci: version bump to ${version}`]);
    run("git", ["tag", version]);
  }
} else {
  console.log(`  using version ${version} (--no-bump)`);
}

// -------------------------------------------------------------------- build
const base = `${REGISTRY}/${PROJECT}/${AR_REPO}/${IMAGE}`;
const buildArgv = [
  "buildx", "build",
  "--platform", PLATFORM,
  "-f", "Dockerfile",
  ...(customTag
    ? ["-t", `${base}:${customTag}`]
    : ["-t", `${base}:${version}`, "-t", `${base}:latest`]),
  "--push", ".",
];
runWithRetry("docker", buildArgv);

// ------------------------------------------------------------------- finish
if (!dryRun && !customTag && !has("--no-bump")) {
  run("git", ["push", "origin", "HEAD", "--tags"]);
}

console.log(dryRun ? "\nDry run — nothing built or pushed." : customTag ? `
Pushed ${IMAGE} as :${customTag}.

Flux matches semver only, so nothing has been deployed. Check what you built:

  docker manifest inspect ${base}:${customTag} \\
    | grep -A2 platform
` : `
Pushed ${IMAGE} at ${version}.

Flux polls the registry every minute and updates the deployment itself; there
is nothing to apply by hand. Watch it land with:

  kubectl get deploy -n ${IMAGE} -w
`);
