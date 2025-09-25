import type { RequestHandler } from "express";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const r = await pool.query("SELECT id, email, full_name, password_hash FROM users WHERE email=$1", [email]);
  if (!r.rowCount) return res.status(401).json({ error: "Invalid credentials" });
  const u = r.rows[0];
  if (!u.password_hash) return res.status(401).json({ error: "Password not set" });
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const secret = process.env.JWT_SECRET || "dev-secret";
  const token = jwt.sign({ sub: u.id, email: u.email }, secret, { expiresIn: "7d" });
  const rolesRes = await pool.query(
    `SELECT r.name as role FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = $1`,
    [u.id],
  );
  res.json({ token, user: { id: u.id, email: u.email, fullName: u.full_name, roles: rolesRes.rows.map((r) => r.role) } });
};

export const me: RequestHandler = async (req, res) => {
  // This endpoint expects requireAuth middleware to set req.user
  res.json({ user: (req as any).user || null });
};
