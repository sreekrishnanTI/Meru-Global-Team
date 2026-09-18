import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { query } from "../db/pool.js";
import { upload, UPLOADS_DIR } from "../middleware/upload.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Synchronize upload to Next.js public directory if accessible
function syncToNextPublic(subfolder: string, filename: string, sourcePath: string) {
  try {
    const nextPublicDir = path.resolve(process.cwd(), "../Accadio/public/uploads", subfolder);
    if (!fs.existsSync(nextPublicDir)) {
      fs.mkdirSync(nextPublicDir, { recursive: true });
    }
    const targetPath = path.join(nextPublicDir, filename);
    fs.copyFileSync(sourcePath, targetPath);
  } catch (err) {
    // Non-fatal if folder structure differs
  }
}

// GET /api/media (List all uploaded media)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { type, category, search } = req.query;
    let sql = `SELECT * FROM media WHERE 1=1`;
    const params: any[] = [];

    if (type) {
      params.push(type);
      sql += ` AND file_type = $${params.length}`;
    }

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND original_name ILIKE $${params.length}`;
    }

    sql += ` ORDER BY uploaded_at DESC`;

    const result = await query(sql, params);
    const items = result.rows.map((r) => ({
      id: r.id,
      filename: r.filename,
      originalName: r.original_name,
      mimeType: r.mime_type,
      type: r.file_type,
      size: Number(r.size),
      path: r.path,
      url: r.url,
      category: r.category,
      uploadedAt: r.uploaded_at,
    }));

    return res.json(items);
  } catch (error: any) {
    console.error("GET media error:", error);
    return res.status(500).json({ error: "Failed to fetch media: " + error.message });
  }
});

// POST /api/media/upload (Upload single or multiple files)
router.post(
  "/upload",
  (req, res, next) => {
    upload.array("files", 10)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const host = req.get("host") || "localhost:5000";
      const protocol = req.protocol || "http";
      const baseUrl = `${protocol}://${host}`;

      const savedMedia = [];

      for (const file of files) {
        const isImage = file.mimetype.startsWith("image/");
        const fileType = isImage ? "image" : "video";
        const category = (req.body.category as string) || (isImage ? "images" : "videos");

        // Web accessible path and absolute URL
        const subfolder = path.basename(file.destination);
        const relativePath = `/uploads/${subfolder}/${file.filename}`;
        const fullUrl = `${baseUrl}${relativePath}`;

        // Sync to Next.js public uploads
        syncToNextPublic(subfolder, file.filename, file.path);

        const insertRes = await query(`
          INSERT INTO media (
            filename, original_name, mime_type, file_type, size, path, url, category
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [
          file.filename,
          file.originalname,
          file.mimetype,
          fileType,
          file.size,
          relativePath,
          fullUrl,
          category,
        ]);

        const r = insertRes.rows[0];
        savedMedia.push({
          id: r.id,
          filename: r.filename,
          originalName: r.original_name,
          mimeType: r.mime_type,
          type: r.file_type,
          size: Number(r.size),
          path: r.path, // e.g. /uploads/images/abc.webp
          url: r.url,   // e.g. http://localhost:5000/uploads/images/abc.webp
          category: r.category,
          uploadedAt: r.uploaded_at,
        });
      }

      // If single file uploaded, return both object and array for convenience
      return res.status(201).json({
        success: true,
        files: savedMedia,
        file: savedMedia[0], // for single file upload callers
        url: savedMedia[0].path, // direct path to put in inputs
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      return res.status(500).json({ error: "Failed to process upload: " + error.message });
    }
  }
);

// DELETE /api/media/:id (Delete media item)
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const itemRes = await query(`SELECT * FROM media WHERE id = $1`, [req.params.id]);
    if (itemRes.rowCount === 0) {
      return res.status(404).json({ error: "Media item not found" });
    }

    const item = itemRes.rows[0];

    // Remove file from disk
    try {
      const filePath = path.join(UPLOADS_DIR, item.category || "images", item.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      // Also remove from Next public uploads if exists
      const nextPublicPath = path.resolve(process.cwd(), "../Accadio/public", item.path.replace(/^\//, ""));
      if (fs.existsSync(nextPublicPath)) {
        fs.unlinkSync(nextPublicPath);
      }
    } catch (err) {
      console.warn("Disk file deletion error:", err);
    }

    await query(`DELETE FROM media WHERE id = $1`, [req.params.id]);
    return res.json({ success: true, message: "Media deleted successfully" });
  } catch (error: any) {
    console.error("DELETE media error:", error);
    return res.status(500).json({ error: "Failed to delete media: " + error.message });
  }
});

export default router;
