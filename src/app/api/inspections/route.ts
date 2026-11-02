import { NextRequest, NextResponse } from "next/server";
import { insertInspection, InspectionInput } from "@/app/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t.length ? t : null;
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

// A signature arrives as a PNG data URL from the canvas. Reject anything else
// rather than storing an arbitrary string in a record that is meant to evidence
// who signed what.
function signature(v: unknown): string | null {
  if (typeof v !== "string") return null;
  if (!v.startsWith("data:image/png;base64,")) return null;
  if (v.length > 400_000) return null;
  return v;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const ownerName = str(b.ownerName, 120);
  const residentName = str(b.residentName, 120);
  const ownerSignature = signature(b.ownerSignature);
  const residentSignature = signature(b.residentSignature);

  if (!ownerName || !ownerSignature) {
    return NextResponse.json({ error: "Owner name and signature are required" }, { status: 400 });
  }
  if (!residentName || !residentSignature) {
    return NextResponse.json({ error: "Resident name and signature are required" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;

  const input: InspectionInput = {
    property: str(b.property, 200) ?? "The Last Resort Lodge",
    tenantName: str(b.tenantName, 200) ?? "Idaho Transportation Department",
    inspectionDate: str(b.inspectionDate, 40),
    payload: b.payload ?? {},
    ownerName,
    ownerTitle: str(b.ownerTitle, 120),
    ownerSignature,
    residentName,
    residentTitle: str(b.residentTitle, 120),
    residentSignature,
    depositHeld: num(b.depositHeld),
    deductions: num(b.deductions),
    refund: num(b.refund),
    ip,
  };

  const row = insertInspection(input);
  return NextResponse.json({ id: row.id, signedAt: row.signedAt }, { status: 201 });
}
