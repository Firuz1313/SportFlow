import type { RequestHandler } from "express";
import { readFileSync } from "fs";
import path from "path";

let pool: any | null = null;
async function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (pool) return pool;
  const { Pool } = await import("pg");
  pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  return pool;
}

export const runSeed: RequestHandler = async (_req, res) => {
  try {
    const pg = await getPool();
    if (!pg) return res.status(400).json({ error: "Database not configured" });

    const schema = readFileSync(path.resolve(process.cwd(), "server/sql/001_schema.sql"), "utf8");
    const seed = readFileSync(path.resolve(process.cwd(), "server/sql/002_seed.sql"), "utf8");

    await pg.query("BEGIN");
    await pg.query(schema);
    await pg.query(seed);

    // set passwords
    const bcrypt = (await import("bcryptjs")).default;
    const adminHash = await bcrypt.hash("admin123", 10);
    const coachHash = await bcrypt.hash("coach123", 10);
    const athleteHash = await bcrypt.hash("athlete123", 10);
    await pg.query("UPDATE users SET password_hash=$1 WHERE id='11111111-1111-1111-1111-111111111111'", [adminHash]);
    await pg.query("UPDATE users SET password_hash=$1 WHERE id='22222222-2222-2222-2222-222222222222'", [coachHash]);
    await pg.query("UPDATE users SET password_hash=$1 WHERE id='33333333-3333-3333-3333-333333333333'", [athleteHash]);

    await pg.query("COMMIT");

    res.json({ ok: true });
  } catch (e) {
    try { const pg = await getPool(); if (pg) await pg.query("ROLLBACK"); } catch {}
    console.error(e);
    res.status(500).json({ error: "Seeding failed" });
  }
};
