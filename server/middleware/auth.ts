import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const secret = process.env.JWT_SECRET || "dev-secret";
    const payload = jwt.verify(token, secret) as { sub: string; email: string };

    const { rows } = await pool.query(
      `SELECT r.name as role FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = $1`,
      [payload.sub],
    );
    req.user = {
      id: payload.sub,
      email: payload.email,
      roles: rows.map((r) => r.role),
    };
    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export const requireRole = (...allowed: string[]): RequestHandler => {
  return (req, res, next) => {
    const roles = req.user?.roles || [];
    if (allowed.some((r) => roles.includes(r))) return next();
    return res.status(403).json({ error: "Forbidden" });
  };
};
