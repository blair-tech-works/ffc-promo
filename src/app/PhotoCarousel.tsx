"use client";

import Image from "next/image";
import { useState } from "react";

const PHOTOS = Array.from({ length: 28 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return `/images/airbnb/photo-${n}.jpg`;
});

export default function PhotoCarousel() {
  const [idx, setIdx] = useState(0);

  const prev = () => setIdx((i) => (i === 0 ? PHOTOS.length - 1 : i - 1));
  const next = () => setIdx((i) => (i === PHOTOS.length - 1 ? 0 : i + 1));

  return (
    <div className="relative max-w-5xl mx-auto">
      <div className="relative aspect-[3/2] rounded overflow-hidden">
        <Image
          src={PHOTOS[idx]}
          alt={`Lodge photo ${idx + 1} of ${PHOTOS.length}`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 1024px"
          priority={idx === 0}
        />

        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "rgba(0,0,0,0.5)", color: "white" }}
          aria-label="Previous photo"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "rgba(0,0,0,0.5)", color: "white" }}
          aria-label="Next photo"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm"
          style={{ background: "rgba(0,0,0,0.6)", color: "white", fontFamily: "var(--font-sans)" }}
        >
          {idx + 1} / {PHOTOS.length}
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {PHOTOS.map((src, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="flex-shrink-0 relative w-16 h-12 rounded overflow-hidden transition-opacity"
            style={{ opacity: i === idx ? 1 : 0.5, border: i === idx ? "2px solid var(--accent-dark)" : "2px solid transparent" }}
          >
            <Image src={src} alt="" fill className="object-cover" sizes="64px" />
          </button>
        ))}
      </div>

      <div className="mt-4 text-center">
        <a
          href={PHOTOS[idx]}
          download
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded text-sm uppercase tracking-wider transition-colors"
          style={{
            background: "var(--accent-dark)",
            color: "white",
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download Photo {idx + 1}
        </a>
      </div>
    </div>
  );
}
