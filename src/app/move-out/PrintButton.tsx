"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print print:hidden px-5 py-2 text-xs tracking-[0.2em] uppercase border rounded"
      style={{ borderColor: "var(--accent-dark)", color: "var(--accent-dark)" }}
    >
      Print / Save PDF
    </button>
  );
}
