import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  listAthletes,
  createAthlete,
  updateAthlete,
  deleteAthlete,
} from "./routes/athletes";
import path from "path";
import expressStatic from "express";
import { uploader, handleUpload } from "./routes/upload";
import { runSeed } from "./routes/seed";
import { login, me } from "./routes/auth";
import { requireAuth, requireRole } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    "/uploads",
    expressStatic.static(path.resolve(process.cwd(), "public", "uploads")),
  );

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth
  app.post("/api/auth/login", login);
  app.get("/api/auth/me", requireAuth, me);

  // Uploads
  app.post("/api/upload", requireAuth, uploader.single("file"), handleUpload);

  // Seed DB with roles/users/athletes
  app.post("/api/seed", requireAuth, requireRole("admin"), runSeed);
  if (process.env.ALLOW_OPEN_SEED === "true") {
    app.post("/api/seed-open", runSeed);
  }

  // Athlete CRUD
  app.get("/api/athletes", listAthletes);
  app.post(
    "/api/athletes",
    requireAuth,
    requireRole("admin", "coach"),
    createAthlete,
  );
  app.put(
    "/api/athletes/:id",
    requireAuth,
    requireRole("admin", "coach"),
    updateAthlete,
  );
  app.delete(
    "/api/athletes/:id",
    requireAuth,
    requireRole("admin"),
    deleteAthlete,
  );

  return app;
}
