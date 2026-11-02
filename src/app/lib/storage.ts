import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomBytes } from "node:crypto";

// Pod-local SQLite, same pattern as huckleberry. This is a convenience record,
// NOT the system of record: the signed PDF both parties leave with is. See the
// note in the deployment manifest about pinning this app to one replica.
const DB_PATH =
  process.env.FFC_DB_PATH ||
  (process.env.NODE_ENV === "production"
    ? "/app/data/inspections.db"
    : ".data/inspections.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS inspections (
      id               TEXT PRIMARY KEY,
      created_at       TEXT NOT NULL,
      property         TEXT NOT NULL,
      tenant_name      TEXT NOT NULL,
      inspection_date  TEXT,
      payload          TEXT NOT NULL,
      owner_name       TEXT,
      owner_title      TEXT,
      owner_signature  TEXT,
      resident_name    TEXT,
      resident_title   TEXT,
      resident_signature TEXT,
      deposit_held     REAL NOT NULL DEFAULT 0,
      deductions       REAL NOT NULL DEFAULT 0,
      refund           REAL NOT NULL DEFAULT 0,
      ip               TEXT,
      signed_at        TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_inspections_created ON inspections (created_at DESC);
  `);
  return db;
}

export type InspectionInput = {
  property: string;
  tenantName: string;
  inspectionDate: string | null;
  /** Full form state as JSON — sections, marks, notes, charges, comments. */
  payload: unknown;
  ownerName: string;
  ownerTitle: string | null;
  ownerSignature: string;
  residentName: string;
  residentTitle: string | null;
  residentSignature: string;
  depositHeld: number;
  deductions: number;
  refund: number;
  ip: string | null;
};

export type InspectionRow = Omit<InspectionInput, "payload"> & {
  id: string;
  createdAt: string;
  signedAt: string;
  payload: unknown;
};

type DbRow = {
  id: string;
  created_at: string;
  property: string;
  tenant_name: string;
  inspection_date: string | null;
  payload: string;
  owner_name: string;
  owner_title: string | null;
  owner_signature: string;
  resident_name: string;
  resident_title: string | null;
  resident_signature: string;
  deposit_held: number;
  deductions: number;
  refund: number;
  ip: string | null;
  signed_at: string;
};

function toRow(r: DbRow): InspectionRow {
  let payload: unknown = null;
  try {
    payload = JSON.parse(r.payload);
  } catch {
    /* a malformed blob should not take down the whole report view */
  }
  return {
    id: r.id,
    createdAt: r.created_at,
    property: r.property,
    tenantName: r.tenant_name,
    inspectionDate: r.inspection_date,
    payload,
    ownerName: r.owner_name,
    ownerTitle: r.owner_title,
    ownerSignature: r.owner_signature,
    residentName: r.resident_name,
    residentTitle: r.resident_title,
    residentSignature: r.resident_signature,
    depositHeld: r.deposit_held,
    deductions: r.deductions,
    refund: r.refund,
    ip: r.ip,
    signedAt: r.signed_at,
  };
}

export function insertInspection(input: InspectionInput): InspectionRow {
  const id = randomBytes(5).toString("hex");
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO inspections (
         id, created_at, property, tenant_name, inspection_date, payload,
         owner_name, owner_title, owner_signature,
         resident_name, resident_title, resident_signature,
         deposit_held, deductions, refund, ip, signed_at
       ) VALUES (
         @id, @createdAt, @property, @tenantName, @inspectionDate, @payload,
         @ownerName, @ownerTitle, @ownerSignature,
         @residentName, @residentTitle, @residentSignature,
         @depositHeld, @deductions, @refund, @ip, @signedAt
       )`
    )
    .run({
      id,
      createdAt: now,
      property: input.property,
      tenantName: input.tenantName,
      inspectionDate: input.inspectionDate,
      payload: JSON.stringify(input.payload ?? {}),
      ownerName: input.ownerName,
      ownerTitle: input.ownerTitle,
      ownerSignature: input.ownerSignature,
      residentName: input.residentName,
      residentTitle: input.residentTitle,
      residentSignature: input.residentSignature,
      depositHeld: input.depositHeld,
      deductions: input.deductions,
      refund: input.refund,
      ip: input.ip,
      signedAt: now,
    });
  return { ...input, id, createdAt: now, signedAt: now };
}

export function getInspection(id: string): InspectionRow | null {
  const row = getDb().prepare(`SELECT * FROM inspections WHERE id = ?`).get(id) as DbRow | undefined;
  return row ? toRow(row) : null;
}

export function listInspections(): InspectionRow[] {
  const rows = getDb()
    .prepare(`SELECT * FROM inspections ORDER BY created_at DESC LIMIT 200`)
    .all() as DbRow[];
  return rows.map(toRow);
}
