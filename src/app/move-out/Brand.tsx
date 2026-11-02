// Shared header for the move-out pages. Uses the horizontal lock-up from the
// TLR brand guide (ceremony, Dec 2018). The lock-up ships as black artwork;
// Pantone 021 C is the only accent the identity uses, so it is applied to
// rules and labels rather than to the mark itself.
export default function Brand({ subtitle }: { subtitle: string }) {
  return (
    <header className="doc-brand mb-10 print:mb-6">
      <div className="flex items-center gap-5 pb-5 border-b-2" style={{ borderColor: "var(--tlr-orange)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- brand lock-up is a static SVG, not an optimizable raster */}
        <img
          src="/images/tlr/tlr-lockup-horizontal.svg"
          alt="The Last Resort Outfitters LLC"
          className="h-12 md:h-14 w-auto"
        />
      </div>
      <p
        className="mt-4 text-[11px] uppercase tracking-[0.35em]"
        style={{ color: "var(--tlr-orange)" }}
      >
        {subtitle}
      </p>
    </header>
  );
}
