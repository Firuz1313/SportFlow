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
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image/video allowed"));
  }
};

export const uploader = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter,
});

export const handleUpload: RequestHandler = async (req, res) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: "No file" });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (supabaseUrl && supabaseKey) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);
      const bucket = "media";
      await supabase.storage
        .createBucket(bucket, { public: true })
        .catch(() => {});
      const pathKey = `${Date.now()}-${path.basename(file.path)}`;
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(pathKey, file.buffer ?? undefined, { upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      return res.status(201).json({ url: pub.publicUrl });
    } catch (e) {
      console.error("Supabase upload failed, falling back to local", e);
    }
  }

  const rel = `/uploads/${path.basename(file.path)}`;
  res.status(201).json({ url: rel });
};
