import type { NextConfig } from "next";

// next.config.ts is compiled to CJS, so import.meta is unavailable here —
// huckleberry gets away with it only because its config is .mjs.
const root = process.cwd();

const nextConfig: NextConfig = {
  output: "standalone",
  // better-sqlite3 is a native module; standalone tracing drops the .node binary
  // unless it is included explicitly.
  outputFileTracingRoot: root,
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/better-sqlite3/**/*"],
    "/move-out/**/*": ["./node_modules/better-sqlite3/**/*"],
  },
  turbopack: {
    root,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
