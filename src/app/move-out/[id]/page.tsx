import { notFound } from "next/navigation";
import PrintButton from "../PrintButton";
import { getInspection } from "@/app/lib/storage";
import { MARKS, type Mark } from "@/app/lib/inspection";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Entry = { mark: Mark; note: string; charge: string };
type Instance = { key: string; name: string; entries: Record<string, Entry> };
type DamageLine = { where: string; label: string; note: string; charge: number };

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const markLabel = (m: Mark) => MARKS.find((x) => x.value === m)?.label ?? "—";

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="mb-2">
      <span className="text-xs uppercase tracking-[0.12em] mr-2" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <span className="text-sm" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

export default async function CompletedReport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = getInspection(id);
  if (!report) notFound();

  const p = (report.payload ?? {}) as {
    header?: Record<string, string>;
    rooms?: Instance[];
    baths?: Instance[];
    damageLines?: DamageLine[];
    residentComments?: string;
    alterations?: Record<string, string>;
    utilities?: Record<string, string>;
    cleaningFee?: number;
    unpaidRent?: number;
  };
  const damage = p.damageLines ?? [];
  const signedOn = new Date(report.signedAt).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="max-w-4xl mx-auto px-5 py-10 print:py-0">
      <div className="flex justify-between items-start mb-8 print:mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "var(--accent-dark)" }}>
            The Last Resort Lodge
          </p>
          <h1 className="text-3xl mb-2">Move-Out Condition Report</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Report {report.id} · signed {signedOn}
          </p>
        </div>
        <PrintButton />
      </div>

      <section className="rounded-lg border p-5 mb-6 bg-white" style={{ borderColor: "var(--stone)" }}>
        <Field label="Property" value={report.property} />
        <Field label="Resident" value={report.tenantName} />
        <Field label="Inspection date" value={report.inspectionDate} />
        <Field label="Time" value={[p.header?.timeStarted, p.header?.timeCompleted].filter(Boolean).join(" – ")} />
        <Field label="Present for Owner" value={p.header?.ownerPresent} />
        <Field label="Present for Resident" value={p.header?.residentPresent} />
        <Field label="Others present" value={p.header?.others} />
        <Field label="Move-in report dated" value={p.header?.moveInReportDate} />
        <Field label="Photos taken" value={p.header?.photoCount} />
      </section>

      <section className="rounded-lg border p-5 mb-6 bg-white" style={{ borderColor: "var(--stone)" }}>
        <h2 className="text-xl mb-4">Conditions recorded as damage</h2>
        {damage.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No conditions were recorded as damage beyond ordinary wear and tear.
          </p>
        ) : (
          damage.map((d, i) => (
            <div key={i} className="flex justify-between gap-4 py-2 border-b text-sm" style={{ borderColor: "var(--stone)" }}>
              <div>
                <span style={{ color: "var(--accent-dark)" }}>{d.where}</span> — {d.label}
                {d.note && <div style={{ color: "var(--text-muted)" }}>{d.note}</div>}
              </div>
              <div className="tabular-nums whitespace-nowrap">{money(d.charge)}</div>
            </div>
          ))
        )}
      </section>

      {(p.rooms?.length || p.baths?.length) && (
        <section className="rounded-lg border p-5 mb-6 bg-white" style={{ borderColor: "var(--stone)" }}>
          <h2 className="text-xl mb-4">Rooms inspected</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {[...(p.rooms ?? []), ...(p.baths ?? [])].map((r, i) => {
              const counts = Object.values(r.entries ?? {}).reduce<Record<string, number>>((acc, e) => {
                if (e.mark) acc[e.mark] = (acc[e.mark] ?? 0) + 1;
                return acc;
              }, {});
              return (
                <span key={i} className="px-3 py-1 rounded" style={{ background: "var(--bg-warm)" }}>
                  {r.name || `Area ${i + 1}`}
                  <span style={{ color: "var(--text-muted)" }}>
                    {" "}
                    · {Object.entries(counts).map(([m, n]) => `${n} ${markLabel(m as Mark)}`).join(", ") || "not marked"}
                  </span>
                </span>
              );
            })}
          </div>
        </section>
      )}

      {p.alterations?.carport && (
        <section className="rounded-lg border p-5 mb-6 bg-white" style={{ borderColor: "var(--stone)" }}>
          <h2 className="text-xl mb-2">Carports and alterations</h2>
          <p className="text-sm whitespace-pre-wrap">{p.alterations.carport}</p>
          {p.alterations.desc && <p className="text-sm mt-2 whitespace-pre-wrap">{p.alterations.desc}</p>}
        </section>
      )}

      <section className="rounded-lg border p-5 mb-6" style={{ borderColor: "var(--stone)", background: "var(--bg-warm)" }}>
        <h2 className="text-xl mb-4">Deposit reconciliation</h2>
        <div className="flex justify-between text-sm py-1">
          <span>Security deposit held</span>
          <span className="tabular-nums">{money(report.depositHeld)}</span>
        </div>
        <div className="flex justify-between text-sm py-1">
          <span>Total deductions</span>
          <span className="tabular-nums">{money(report.deductions)}</span>
        </div>
        <div className="flex justify-between text-lg py-2 border-t mt-1" style={{ borderColor: "var(--accent)", color: "var(--text-primary)" }}>
          <span>Balance to refund</span>
          <span className="tabular-nums font-semibold">{money(report.refund)}</span>
        </div>
        <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>
          Lease Section 7 requires the itemized statement and balance within 30 days of termination
          and delivery of possession — due by 2 December 2026.
        </p>
      </section>

      {p.residentComments && (
        <section className="rounded-lg border p-5 mb-6 bg-white" style={{ borderColor: "var(--stone)" }}>
          <h2 className="text-xl mb-2">Resident statement</h2>
          <p className="text-sm whitespace-pre-wrap">{p.residentComments}</p>
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            Signing does not waive the Resident&rsquo;s right to dispute a charge.
          </p>
        </section>
      )}

      <section className="rounded-lg border p-5 bg-white" style={{ borderColor: "var(--stone)" }}>
        <h2 className="text-xl mb-5">Signatures</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { role: "Owner / Agent", name: report.ownerName, title: report.ownerTitle, sig: report.ownerSignature },
            { role: "Resident — Idaho Transportation Department", name: report.residentName, title: report.residentTitle, sig: report.residentSignature },
          ].map((s) => (
            <div key={s.role}>
              <p className="text-xs uppercase tracking-[0.12em] mb-2" style={{ color: "var(--text-muted)" }}>
                {s.role}
              </p>
              <div className="border-b pb-1 mb-2" style={{ borderColor: "var(--text-primary)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- signature is a stored data: URL, not an optimizable asset */}
                <img src={s.sig} alt={`${s.name} signature`} className="h-[75px] w-auto object-contain" />
              </div>
              <p className="text-sm">{s.name}</p>
              {s.title && (
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {s.title}
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          Signed electronically {signedOn}. Report identifier {report.id}.
        </p>
      </section>
    </div>
  );
}
