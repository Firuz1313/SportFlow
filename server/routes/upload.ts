import type { RequestHandler } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import { mkdirSync, existsSync } from "fs";
import path from "path";

const uploadDir = path.resolve(process.cwd(), "public", "uploads");
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const id = randomUUID();
    const cleaned = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_");
    cb(null, `${id}-${cleaned}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image/video allowed"));
  }
};

export const uploader = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 }, fileFilter });

export const handleUpload: RequestHandler = (req, res) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: "No file" });
  const rel = `/uploads/${path.basename(file.path)}`;
  res.status(201).json({ url: rel });
};
