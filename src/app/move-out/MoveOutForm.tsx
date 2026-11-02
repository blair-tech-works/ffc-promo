"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SignaturePad from "./SignaturePad";
import {
  SECTIONS,
  ROOM_TEMPLATE,
  MARKS,
  CLEANING_FEE_CAP,
  DEPOSIT_HELD,
  type Mark,
  type Section,
} from "@/app/lib/inspection";

type Entry = { mark: Mark; note: string; charge: string };
type KeyEntry = { issued: string; returned: string; charge: string };
type Instance = { key: string; name: string; entries: Record<string, Entry> };

const blank = (): Entry => ({ mark: "", note: "", charge: "" });

// Derived from the SECTIONS constant, so these are stable for the life of the
// module and must not sit inside the component as memo dependencies.
const KEY_SECTION = SECTIONS.find((s) => s.id === "keys")!;
const BATH_TEMPLATE = SECTIONS.find((s) => s.id === "bath")!;
const CONDITION_SECTIONS = SECTIONS.filter((s) => s.id !== "keys" && !s.repeatable);

function entriesFor(section: Section): Record<string, Entry> {
  return Object.fromEntries(section.lines.map((l) => [l.id, blank()]));
}

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const toNum = (s: string) => {
  const n = Number(String(s).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const fieldCls =
  "w-full px-3 py-2 rounded border bg-white text-sm outline-none focus:border-[var(--accent-dark)]";
const fieldStyle = { borderColor: "var(--stone)", color: "var(--text-primary)" };
const labelCls = "block text-xs uppercase tracking-[0.15em] mb-1";
const labelStyle = { color: "var(--text-muted)" };

export default function MoveOutForm() {
  const router = useRouter();

  const [header, setHeader] = useState({
    inspectionDate: new Date().toISOString().slice(0, 10),
    timeStarted: "",
    timeCompleted: "",
    ownerPresent: "",
    residentPresent: "",
    others: "",
    moveInReportDate: "",
    photoCount: "",
  });

  const [keys, setKeys] = useState<Record<string, KeyEntry>>(
    Object.fromEntries(KEY_SECTION.lines.map((l) => [l.id, { issued: "", returned: "", charge: "" }]))
  );
  const [sections, setSections] = useState<Record<string, Record<string, Entry>>>(
    Object.fromEntries(CONDITION_SECTIONS.map((s) => [s.id, entriesFor(s)]))
  );
  const [rooms, setRooms] = useState<Instance[]>([
    { key: "r1", name: "", entries: entriesFor(ROOM_TEMPLATE) },
  ]);
  const [baths, setBaths] = useState<Instance[]>([
    { key: "b1", name: "", entries: entriesFor(BATH_TEMPLATE) },
  ]);

  const [alterations, setAlterations] = useState({ made: "no", desc: "", approved: "", restored: "", carport: "", removed: "" });
  const [utilities, setUtilities] = useState({ electric: "", gas: "", propane: "" });
  const [cleaningFee, setCleaningFee] = useState("");
  const [unpaidRent, setUnpaidRent] = useState("");
  const [residentComments, setResidentComments] = useState("");

  const [ownerName, setOwnerName] = useState("");
  const [ownerTitle, setOwnerTitle] = useState("");
  const [ownerSignature, setOwnerSignature] = useState<string | null>(null);
  const [residentName, setResidentName] = useState("");
  const [residentTitle, setResidentTitle] = useState("");
  const [residentSignature, setResidentSignature] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Only lines marked "D" can carry money. Section 7 makes ordinary wear and
  // tear non-chargeable, so the form refuses to total anything else — the most
  // common way a deposit deduction gets thrown out is charging for wear.
  const lineCharges = useMemo(() => {
    let total = 0;
    const collect = (entries: Record<string, Entry>) => {
      for (const e of Object.values(entries)) if (e.mark === "D") total += toNum(e.charge);
    };
    Object.values(sections).forEach(collect);
    rooms.forEach((r) => collect(r.entries));
    baths.forEach((b) => collect(b.entries));
    return total;
  }, [sections, rooms, baths]);

  const keyCharges = useMemo(
    () => Object.values(keys).reduce((sum, k) => sum + toNum(k.charge), 0),
    [keys]
  );

  const cappedCleaning = Math.min(toNum(cleaningFee), CLEANING_FEE_CAP);
  const deductions = lineCharges + keyCharges + cappedCleaning + toNum(unpaidRent);
  const refund = DEPOSIT_HELD - deductions;

  const damageLines = useMemo(() => {
    const out: { where: string; label: string; note: string; charge: number }[] = [];
    const walk = (where: string, section: Section, entries: Record<string, Entry>) => {
      for (const line of section.lines) {
        const e = entries[line.id];
        if (e?.mark === "D") out.push({ where, label: line.label, note: e.note, charge: toNum(e.charge) });
      }
    };
    CONDITION_SECTIONS.forEach((s) => walk(s.title, s, sections[s.id] ?? {}));
    rooms.forEach((r, i) => walk(r.name || `Room ${i + 1}`, ROOM_TEMPLATE, r.entries));
    baths.forEach((b, i) => walk(b.name || `Bathroom ${i + 1}`, BATH_TEMPLATE, b.entries));
    return out;
  }, [sections, rooms, baths]);

  const setEntry = (sectionId: string, lineId: string, patch: Partial<Entry>) =>
    setSections((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [lineId]: { ...prev[sectionId][lineId], ...patch } },
    }));

  const setInstanceEntry = (
    list: Instance[],
    setList: (v: Instance[]) => void,
    key: string,
    lineId: string,
    patch: Partial<Entry>
  ) =>
    setList(
      list.map((inst) =>
        inst.key === key
          ? { ...inst, entries: { ...inst.entries, [lineId]: { ...inst.entries[lineId], ...patch } } }
          : inst
      )
    );

  const canSubmit =
    ownerName.trim() && ownerSignature && residentName.trim() && residentSignature && !submitting;

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property: "The Last Resort Lodge, 5538 U.S. Highway 95, New Meadows, ID 83654",
          tenantName: "Idaho Transportation Department — District 2, Lewiston",
          inspectionDate: header.inspectionDate,
          payload: {
            header,
            keys,
            sections,
            rooms,
            baths,
            alterations,
            utilities,
            cleaningFee: cappedCleaning,
            unpaidRent: toNum(unpaidRent),
            residentComments,
            damageLines,
          },
          ownerName,
          ownerTitle,
          ownerSignature,
          residentName,
          residentTitle,
          residentSignature,
          depositHeld: DEPOSIT_HELD,
          deductions,
          refund,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save the report");
      router.push(`/move-out/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the report");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: "var(--accent-dark)" }}>
          The Last Resort Lodge
        </p>
        <h1 className="text-3xl md:text-4xl mb-3">Move-Out Condition Report</h1>
        <p className="text-sm max-w-2xl" style={{ color: "var(--text-muted)" }}>
          Joint walk-through record and deposit reconciliation, prepared under Sections 7, 11, 12 and
          38 of the lease between The Last Resort LLC and the Idaho Transportation Department.
        </p>
      </header>

      <Card title="Inspection details">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls} style={labelStyle}>Date of inspection</label>
            <input type="date" value={header.inspectionDate} onChange={(e) => setHeader({ ...header, inspectionDate: e.target.value })} className={fieldCls} style={fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Time started</label>
            <input type="time" value={header.timeStarted} onChange={(e) => setHeader({ ...header, timeStarted: e.target.value })} className={fieldCls} style={fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Time completed</label>
            <input type="time" value={header.timeCompleted} onChange={(e) => setHeader({ ...header, timeCompleted: e.target.value })} className={fieldCls} style={fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Present for Owner</label>
            <input value={header.ownerPresent} onChange={(e) => setHeader({ ...header, ownerPresent: e.target.value })} className={fieldCls} style={fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Present for Resident</label>
            <input value={header.residentPresent} onChange={(e) => setHeader({ ...header, residentPresent: e.target.value })} className={fieldCls} style={fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Others present</label>
            <input value={header.others} onChange={(e) => setHeader({ ...header, others: e.target.value })} className={fieldCls} style={fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Signed move-in report dated</label>
            <input value={header.moveInReportDate} onChange={(e) => setHeader({ ...header, moveInReportDate: e.target.value })} placeholder="Baseline for every charge" className={fieldCls} style={fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Photos taken</label>
            <input value={header.photoCount} onChange={(e) => setHeader({ ...header, photoCount: e.target.value })} placeholder="How many" className={fieldCls} style={fieldStyle} />
          </div>
        </div>
        <p className="text-sm mt-4 p-3 rounded" style={{ background: "var(--bg-warm)", color: "var(--text-muted)" }}>
          Lease Section 11 makes the signed Move-In Condition Report the basis for evaluating any
          cleaning or damage charge. Mark <strong>Wear</strong> for ordinary wear and tear — it is not
          chargeable and this form will not total it. Only <strong>Damage</strong> lines accept an amount.
        </p>
      </Card>

      <Card title={KEY_SECTION.title} clause={KEY_SECTION.clause} note={KEY_SECTION.note}>
        <div className="grid grid-cols-12 gap-2 text-xs uppercase tracking-[0.1em] pb-2" style={{ color: "var(--text-muted)" }}>
          <div className="col-span-4">Item</div>
          <div className="col-span-2">Issued</div>
          <div className="col-span-2">Returned</div>
          <div className="col-span-2">Replacement</div>
          <div className="col-span-2">Charge</div>
        </div>
        {KEY_SECTION.lines.map((l) => (
          <div key={l.id} className="grid grid-cols-12 gap-2 py-2 border-b items-center" style={{ borderColor: "var(--stone)" }}>
            <div className="col-span-4 text-sm">{l.label}</div>
            <div className="col-span-2">
              <input value={keys[l.id].issued} onChange={(e) => setKeys({ ...keys, [l.id]: { ...keys[l.id], issued: e.target.value } })} className={fieldCls} style={fieldStyle} />
            </div>
            <div className="col-span-2">
              <input value={keys[l.id].returned} onChange={(e) => setKeys({ ...keys, [l.id]: { ...keys[l.id], returned: e.target.value } })} className={fieldCls} style={fieldStyle} />
            </div>
            <div className="col-span-2 text-sm" style={{ color: "var(--text-muted)" }}>
              {l.unitCost ? `${money(l.unitCost)} ea` : "—"}
            </div>
            <div className="col-span-2">
              <input value={keys[l.id].charge} onChange={(e) => setKeys({ ...keys, [l.id]: { ...keys[l.id], charge: e.target.value } })} placeholder="$0.00" inputMode="decimal" className={fieldCls} style={fieldStyle} />
            </div>
          </div>
        ))}
      </Card>

      {CONDITION_SECTIONS.map((s) => (
        <Card key={s.id} title={s.title} clause={s.clause} note={s.note}>
          {s.lines.map((l) => (
            <MarkRow key={l.id} lineLabel={l.label} entry={sections[s.id][l.id]} onChange={(p) => setEntry(s.id, l.id, p)} />
          ))}
        </Card>
      ))}

      <Card title="Rooms" note="Add a card for each room. Record walls, floor, doors, windows, fixtures, closets and cleanliness.">
        {rooms.map((room, i) => (
          <div key={room.key} className="mb-6 pb-4 border-b last:border-0" style={{ borderColor: "var(--stone)" }}>
            <div className="flex gap-3 items-end mb-3">
              <div className="flex-1">
                <label className={labelCls} style={labelStyle}>Room name</label>
                <input value={room.name} onChange={(e) => setRooms(rooms.map((r) => (r.key === room.key ? { ...r, name: e.target.value } : r)))} placeholder={`Room ${i + 1}`} className={fieldCls} style={fieldStyle} />
              </div>
              {rooms.length > 1 && (
                <button type="button" onClick={() => setRooms(rooms.filter((r) => r.key !== room.key))} className="text-xs underline pb-2" style={{ color: "var(--accent-dark)" }}>
                  Remove
                </button>
              )}
            </div>
            {ROOM_TEMPLATE.lines.map((l) => (
              <MarkRow key={l.id} lineLabel={l.label} entry={room.entries[l.id]} onChange={(p) => setInstanceEntry(rooms, setRooms, room.key, l.id, p)} />
            ))}
          </div>
        ))}
        <button type="button" onClick={() => setRooms([...rooms, { key: `r${Date.now()}`, name: "", entries: entriesFor(ROOM_TEMPLATE) }])} className="px-4 py-2 text-sm border rounded" style={{ borderColor: "var(--accent-dark)", color: "var(--accent-dark)" }}>
          + Add room
        </button>
      </Card>

      <Card title="Bathrooms">
        {baths.map((bath, i) => (
          <div key={bath.key} className="mb-6 pb-4 border-b last:border-0" style={{ borderColor: "var(--stone)" }}>
            <div className="flex gap-3 items-end mb-3">
              <div className="flex-1">
                <label className={labelCls} style={labelStyle}>Bathroom</label>
                <input value={bath.name} onChange={(e) => setBaths(baths.map((b) => (b.key === bath.key ? { ...b, name: e.target.value } : b)))} placeholder={`Bathroom ${i + 1}`} className={fieldCls} style={fieldStyle} />
              </div>
              {baths.length > 1 && (
                <button type="button" onClick={() => setBaths(baths.filter((b) => b.key !== bath.key))} className="text-xs underline pb-2" style={{ color: "var(--accent-dark)" }}>
                  Remove
                </button>
              )}
            </div>
            {BATH_TEMPLATE.lines.map((l) => (
              <MarkRow key={l.id} lineLabel={l.label} entry={bath.entries[l.id]} onChange={(p) => setInstanceEntry(baths, setBaths, bath.key, l.id, p)} />
            ))}
          </div>
        ))}
        <button type="button" onClick={() => setBaths([...baths, { key: `b${Date.now()}`, name: "", entries: entriesFor(BATH_TEMPLATE) }])} className="px-4 py-2 text-sm border rounded" style={{ borderColor: "var(--accent-dark)", color: "var(--accent-dark)" }}>
          + Add bathroom
        </button>
      </Card>

      <Card title="Alterations, property removal and restoration" clause="Lease Sections 31 and 38">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={labelStyle}>Alterations made during tenancy?</label>
            <select value={alterations.made} onChange={(e) => setAlterations({ ...alterations, made: e.target.value })} className={fieldCls} style={fieldStyle}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Removed and premises restored?</label>
            <input value={alterations.restored} onChange={(e) => setAlterations({ ...alterations, restored: e.target.value })} className={fieldCls} style={fieldStyle} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls} style={labelStyle}>Describe</label>
            <textarea value={alterations.desc} onChange={(e) => setAlterations({ ...alterations, desc: e.target.value })} rows={2} className={fieldCls} style={fieldStyle} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls} style={labelStyle}>Carports — who paid, does it stay, is removal expected?</label>
            <textarea value={alterations.carport} onChange={(e) => setAlterations({ ...alterations, carport: e.target.value })} rows={2} placeholder="$3,561.74 was recorded 11 Feb 2026 as &quot;ITD Carports&quot; — settle this in writing here" className={fieldCls} style={fieldStyle} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls} style={labelStyle}>All personal property, trash and debris removed?</label>
            <input value={alterations.removed} onChange={(e) => setAlterations({ ...alterations, removed: e.target.value })} className={fieldCls} style={fieldStyle} />
          </div>
        </div>
      </Card>

      <Card title="Utilities and final meter readings" clause="Lease Section 4" note="Resident is responsible for electric and gas, billed by The Last Resort LLC with original bills attached.">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls} style={labelStyle}>Electric final reading</label>
            <input value={utilities.electric} onChange={(e) => setUtilities({ ...utilities, electric: e.target.value })} className={fieldCls} style={fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Gas final reading</label>
            <input value={utilities.gas} onChange={(e) => setUtilities({ ...utilities, gas: e.target.value })} className={fieldCls} style={fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Propane tank level</label>
            <input value={utilities.propane} onChange={(e) => setUtilities({ ...utilities, propane: e.target.value })} className={fieldCls} style={fieldStyle} />
          </div>
        </div>
      </Card>

      <Card title="Deposit reconciliation" clause="Lease Section 7">
        {damageLines.length > 0 && (
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--text-muted)" }}>
              Lines marked as damage
            </p>
            {damageLines.map((d, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b" style={{ borderColor: "var(--stone)" }}>
                <span>
                  <span style={{ color: "var(--accent-dark)" }}>{d.where}</span> — {d.label}
                  {d.note ? ` · ${d.note}` : ""}
                </span>
                <span className="tabular-nums">{money(d.charge)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className={labelCls} style={labelStyle}>Base cleaning fee — capped at {money(CLEANING_FEE_CAP)}</label>
            <input value={cleaningFee} onChange={(e) => setCleaningFee(e.target.value)} placeholder="$0.00" inputMode="decimal" className={fieldCls} style={fieldStyle} />
            {toNum(cleaningFee) > CLEANING_FEE_CAP && (
              <p className="text-xs mt-1" style={{ color: "#a33" }}>
                Section 7(d) caps this at {money(CLEANING_FEE_CAP)} — {money(CLEANING_FEE_CAP)} will be used.
              </p>
            )}
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Unpaid rent or other sums due</label>
            <input value={unpaidRent} onChange={(e) => setUnpaidRent(e.target.value)} placeholder="$0.00" inputMode="decimal" className={fieldCls} style={fieldStyle} />
          </div>
        </div>
        <div className="rounded p-4" style={{ background: "var(--bg-warm)" }}>
          {[
            ["Damage and condition charges", lineCharges],
            ["Keys and access devices", keyCharges],
            ["Base cleaning fee", cappedCleaning],
            ["Unpaid rent or other sums", toNum(unpaidRent)],
          ].map(([label, val]) => (
            <div key={label as string} className="flex justify-between text-sm py-1">
              <span>{label as string}</span>
              <span className="tabular-nums">{money(val as number)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm py-2 border-t mt-2 font-semibold" style={{ borderColor: "var(--accent)" }}>
            <span>Total proposed deductions</span>
            <span className="tabular-nums">{money(deductions)}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span>Security deposit held</span>
            <span className="tabular-nums">{money(DEPOSIT_HELD)}</span>
          </div>
          <div className="flex justify-between text-lg py-2 border-t mt-1" style={{ borderColor: "var(--accent)", color: "var(--text-primary)" }}>
            <span>Balance to refund</span>
            <span className="tabular-nums font-semibold">{money(refund)}</span>
          </div>
          {refund < 0 && (
            <p className="text-xs mt-2" style={{ color: "#a33" }}>
              Deductions exceed the deposit. Section 7 leaves the Resident liable for the difference,
              but that is a separate claim — it is not withheld from this refund.
            </p>
          )}
        </div>
        <p className="text-sm mt-4" style={{ color: "var(--text-muted)" }}>
          Section 7 requires a full and specific itemized statement and the balance within{" "}
          <strong>30 days</strong> of termination and delivery of possession. Tenancy ends 2 November
          2026, so the statement and refund are due by <strong>2 December 2026</strong>.
        </p>
      </Card>

      <Card title="Resident statement" note="Signing does not waive the Resident's right to dispute a charge.">
        <textarea value={residentComments} onChange={(e) => setResidentComments(e.target.value)} rows={4} placeholder="Resident comments" className={fieldCls} style={fieldStyle} />
      </Card>

      <Card title="Signatures" note="Both parties sign here. Each receives a copy of the completed report.">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-base mb-3">Owner / Agent</h3>
            <div className="mb-3">
              <label className={labelCls} style={labelStyle}>Print name *</label>
              <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={fieldCls} style={fieldStyle} />
            </div>
            <div className="mb-4">
              <label className={labelCls} style={labelStyle}>Title</label>
              <input value={ownerTitle} onChange={(e) => setOwnerTitle(e.target.value)} className={fieldCls} style={fieldStyle} />
            </div>
            <SignaturePad label="Owner signature *" onChange={setOwnerSignature} />
          </div>
          <div>
            <h3 className="text-base mb-3">Resident — Idaho Transportation Department</h3>
            <div className="mb-3">
              <label className={labelCls} style={labelStyle}>Print name *</label>
              <input value={residentName} onChange={(e) => setResidentName(e.target.value)} className={fieldCls} style={fieldStyle} />
            </div>
            <div className="mb-4">
              <label className={labelCls} style={labelStyle}>Title</label>
              <input value={residentTitle} onChange={(e) => setResidentTitle(e.target.value)} className={fieldCls} style={fieldStyle} />
            </div>
            <SignaturePad label="Resident signature *" onChange={setResidentSignature} />
          </div>
        </div>
      </Card>

      {error && (
        <p className="mb-4 text-sm p-3 rounded" style={{ background: "#fdeaea", color: "#a33" }}>
          {error}
        </p>
      )}

      <div className="flex items-center gap-4 pb-16">
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="px-8 py-3 text-sm tracking-[0.2em] uppercase border transition-all disabled:opacity-40"
          style={
            canSubmit
              ? { background: "var(--accent-dark)", color: "#fff", borderColor: "var(--accent-dark)" }
              : { background: "#fff", color: "var(--text-muted)", borderColor: "var(--stone)" }
          }
        >
          {submitting ? "Saving…" : "Sign and complete report"}
        </button>
        {!canSubmit && !submitting && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Both names and both signatures are required.
          </span>
        )}
      </div>
    </div>
  );
}

function MarkRow({
    lineLabel,
    entry,
    onChange,
}: {
  lineLabel: string;
  entry: Entry;
  onChange: (patch: Partial<Entry>) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 py-3 border-b" style={{ borderColor: "var(--stone)" }}>
      <div className="md:col-span-3 text-sm pt-1" style={{ color: "var(--text-primary)" }}>
        {lineLabel}
      </div>
      <div className="md:col-span-3 flex flex-wrap gap-1">
        {MARKS.map((m) => (
          <button
            key={m.value}
            type="button"
            title={m.hint}
            onClick={() => onChange({ mark: entry.mark === m.value ? "" : m.value, ...(m.value !== "D" ? { charge: "" } : {}) })}
            className="px-2 py-1 text-xs rounded border transition-colors"
            style={
              entry.mark === m.value
                ? { background: "var(--accent-dark)", color: "#fff", borderColor: "var(--accent-dark)" }
                : { background: "#fff", color: "var(--text-muted)", borderColor: "var(--stone)" }
            }
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="md:col-span-4">
        <input
          value={entry.note}
          onChange={(e) => onChange({ note: e.target.value })}
          placeholder={entry.mark === "D" ? "Describe location, size, nature" : "Notes"}
          className={fieldCls}
          style={fieldStyle}
        />
      </div>
      <div className="md:col-span-2">
        {entry.mark === "D" ? (
          <input
            value={entry.charge}
            onChange={(e) => onChange({ charge: e.target.value })}
            placeholder="$0.00"
            inputMode="decimal"
            className={fieldCls}
            style={fieldStyle}
          />
        ) : (
          <div className="text-xs pt-2" style={{ color: "var(--text-muted)" }}>
            {entry.mark === "WT" ? "No charge — wear" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, clause, note, children }: { title: string; clause?: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border p-5 md:p-6 mb-6 bg-white" style={{ borderColor: "var(--stone)" }}>
      <h2 className="text-xl mb-1">{title}</h2>
      {clause && (
        <p className="text-xs uppercase tracking-[0.15em] mb-2" style={{ color: "var(--accent-dark)" }}>
          {clause}
        </p>
      )}
      {note && (
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          {note}
        </p>
      )}
      {children}
    </section>
  );
}
