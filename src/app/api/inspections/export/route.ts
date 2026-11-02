import { NextRequest, NextResponse } from "next/server";
import { listInspections } from "@/app/lib/storage";
import { timingSafeEqual } from "node:crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Unlike huckleberry's survey export, these records carry two people's names,
// titles and signature images. The guard fails CLOSED: with no key configured
// the endpoint is unavailable rather than open.
function authorised(req: NextRequest): boolean {
  const expected = process.env.FFC_EXPORT_KEY;
  if (!expected) return false;
  const supplied =
    req.nextUrl.searchParams.get("key") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!process.env.FFC_EXPORT_KEY) {
    return NextResponse.json(
      { error: "Export is not configured on this deployment." },
      { status: 503 }
    );
  }
  if (!authorised(req)) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const rows = listInspections();
  const body = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      property: "The Last Resort Lodge, New Meadows, Idaho",
      count: rows.length,
      // Signature images travel with the record — an archive without them is
      // not evidence of anything.
      inspections: rows,
    },
    null,
    2
  );

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="tlr-move-out-inspections-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  });
}
