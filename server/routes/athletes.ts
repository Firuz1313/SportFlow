import type { RequestHandler } from "express";
import type { Athlete } from "@shared/api";
import { randomUUID } from "crypto";

let memory: Athlete[] = [];

// Lazy Postgres pool
let pool: any | null = null;
async function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (pool) return pool;
  const { Pool } = await import("pg");
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS athletes (
      id text PRIMARY KEY,
      first_name text NOT NULL,
      last_name text NOT NULL,
      sport text NOT NULL,
      age int NOT NULL,
      avatar_url text,
      video_url text,
      team text,
      metrics jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  return pool;
}

export const listAthletes: RequestHandler = async (_req, res) => {
  try {
    const pg = await getPool();
    if (pg) {
      const r = await pg.query(
        "SELECT * FROM athletes ORDER BY created_at DESC LIMIT 100",
      );
      const items: Athlete[] = r.rows.map((row: any) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        sport: row.sport,
        age: Number(row.age),
        avatarUrl: row.avatar_url ?? undefined,
        videoUrl: row.video_url ?? undefined,
        team: row.team ?? undefined,
        metrics: row.metrics ?? undefined,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
      }));
      res.json({ items, total: items.length });
      return;
    }
    res.json({ items: memory, total: memory.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list athletes" });
  }
};

export const createAthlete: RequestHandler = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      sport,
      age,
      avatarUrl,
      videoUrl,
      team,
      metrics,
    } = req.body ?? {};
    if (!firstName || !lastName || !sport || typeof age !== "number") {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const now = new Date();
    const athlete: Athlete = {
      id: randomUUID(),
      firstName,
      lastName,
      sport,
      age,
      avatarUrl,
      videoUrl,
      team,
      metrics,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    const pg = await getPool();
    if (pg) {
      await pg.query(
        `INSERT INTO athletes (id, first_name, last_name, sport, age, avatar_url, video_url, team, metrics, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          athlete.id,
          athlete.firstName,
          athlete.lastName,
          athlete.sport,
          athlete.age,
          athlete.avatarUrl ?? null,
          athlete.videoUrl ?? null,
          athlete.team ?? null,
          athlete.metrics ?? null,
          athlete.createdAt,
          athlete.updatedAt,
        ],
      );
      res.status(201).json(athlete);
      return;
    }
    memory.unshift(athlete);
    res.status(201).json(athlete);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create athlete" });
  }
};

export const updateAthlete: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const patch = req.body ?? {};
    const pg = await getPool();
    if (pg) {
      const r = await pg.query("SELECT * FROM athletes WHERE id = $1", [id]);
      if (!r.rowCount) return res.status(404).json({ error: "Not found" });
      const existing = r.rows[0];
      const merged = {
        first_name: patch.firstName ?? existing.first_name,
        last_name: patch.lastName ?? existing.last_name,
        sport: patch.sport ?? existing.sport,
        age: typeof patch.age === "number" ? patch.age : existing.age,
        avatar_url: patch.avatarUrl ?? existing.avatar_url,
        video_url: patch.videoUrl ?? existing.video_url,
        team: patch.team ?? existing.team,
        metrics: patch.metrics ?? existing.metrics,
        updated_at: new Date(),
      };
      await pg.query(
        `UPDATE athletes SET first_name=$1,last_name=$2,sport=$3,age=$4,avatar_url=$5,video_url=$6,team=$7,metrics=$8,updated_at=$9 WHERE id=$10`,
        [
          merged.first_name,
          merged.last_name,
          merged.sport,
          merged.age,
          merged.avatar_url,
          merged.video_url,
          merged.team,
          merged.metrics,
          merged.updated_at,
          id,
        ],
      );
      const updated: Athlete = {
        id,
        firstName: merged.first_name,
        lastName: merged.last_name,
        sport: merged.sport,
        age: Number(merged.age),
        avatarUrl: merged.avatar_url ?? undefined,
        videoUrl: merged.video_url ?? undefined,
        team: merged.team ?? undefined,
        metrics: merged.metrics ?? undefined,
        createdAt: existing.created_at.toISOString(),
        updatedAt: (merged.updated_at as Date).toISOString(),
      };
      return res.json(updated);
    }
    const idx = memory.findIndex((a) => a.id === id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    const updated: Athlete = {
      ...memory[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    memory[idx] = updated;
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update athlete" });
  }
};

export const deleteAthlete: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const pg = await getPool();
    if (pg) {
      await pg.query("DELETE FROM athletes WHERE id=$1", [id]);
      return res.status(204).end();
    }
    memory = memory.filter((a) => a.id !== id);
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete athlete" });
  }
};
