"use client";
import { useRef, useState, useEffect } from "react";

// Canvas signature pad (mouse + touch), ported from fieldflow's waiver signing
// flow and typed for this repo. Strokes land on a transparent canvas so the
// exported PNG lays cleanly over a printed signature line.
export default function SignaturePad({
  onChange,
  height = 150,
  penColor = "#1d1d1d",
  label,
}: {
  onChange: (dataUrl: string | null) => void;
  height?: number;
  penColor?: string;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const drawing = useRef(false);
  const [hasSig, setHasSig] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [penColor]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const r = canvas.getBoundingClientRect();
    const src = "touches" in e ? e.touches[0] : e;
    // Scale CSS pixels to canvas pixels so strokes track the pointer at any width.
    return {
      x: (src.clientX - r.left) * (canvas.width / r.width),
      y: (src.clientY - r.top) * (canvas.height / r.height),
    };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    lastPos.current = getPos(e, canvas);
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !lastPos.current) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    if (!hasSig) setHasSig(true);
  };

  const stop = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (hasSig && canvas) onChange(canvas.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
    onChange(null);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
        {hasSig && (
          <button
            type="button"
            onClick={clear}
            className="text-xs underline"
            style={{ color: "var(--accent-dark)" }}
          >
            Clear
          </button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={900}
        height={height}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={stop}
        onMouseLeave={stop}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={stop}
        className="w-full rounded border-2 border-dashed block cursor-crosshair"
        style={{ height, background: "#fff", borderColor: "var(--stone)", touchAction: "none" }}
      />
      {!hasSig && (
        <p className="text-center text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          Sign above with a mouse or finger
        </p>
      )}
    </div>
  );
}
