import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { listAthletes, createAthlete, updateAthlete, deleteAthlete } from "./routes/athletes";
import path from "path";
import expressStatic from "express";
import { uploader, handleUpload } from "./routes/upload";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", expressStatic.static(path.resolve(process.cwd(), "public", "uploads")));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Uploads
  app.post("/api/upload", uploader.single("file"), handleUpload);

  // Athlete CRUD
  app.get("/api/athletes", listAthletes);
  app.post("/api/athletes", createAthlete);
  app.put("/api/athletes/:id", updateAthlete);
  app.delete("/api/athletes/:id", deleteAthlete);

  return app;
}
