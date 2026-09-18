import { Router, Request, Response } from "express";
import { query } from "../db/pool.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// GET /api/pages (List all pages)
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await query(`SELECT * FROM pages ORDER BY title ASC`);
    const pages = result.rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      content: r.content,
      status: r.status,
      metaTitle: r.meta_title,
      metaDescription: r.meta_description,
      lastUpdated: r.last_updated,
    }));
    return res.json(pages);
  } catch (error: any) {
    console.error("GET pages error:", error);
    return res.status(500).json({ error: "Failed to fetch pages: " + error.message });
  }
});

// GET /api/pages/:idOrSlug
router.get("/:idOrSlug", async (req: Request, res: Response) => {
  try {
    const param = String(req.params.idOrSlug);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param);

    const sql = isUuid
      ? `SELECT * FROM pages WHERE id = $1`
      : `SELECT * FROM pages WHERE slug = $1`;

    const result = await query(sql, [param]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    const r = result.rows[0];
    return res.json({
      id: r.id,
      slug: r.slug,
      title: r.title,
      content: r.content,
      status: r.status,
      metaTitle: r.meta_title,
      metaDescription: r.meta_description,
      lastUpdated: r.last_updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/pages (Admin)
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const { title, slug, content = "", status = "published", metaTitle = "", metaDescription = "" } = req.body;
    if (!title || !slug) {
      return res.status(400).json({ error: "Title and slug are required" });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/^-|-$/g, "");

    const insertRes = await query(`
      INSERT INTO pages (title, slug, content, status, meta_title, meta_description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, cleanSlug, content, status, metaTitle, metaDescription]);

    const r = insertRes.rows[0];
    return res.status(201).json({
      id: r.id,
      slug: r.slug,
      title: r.title,
      content: r.content,
      status: r.status,
      metaTitle: r.meta_title,
      metaDescription: r.meta_description,
      lastUpdated: r.last_updated,
    });
  } catch (error: any) {
    console.error("POST page error:", error);
    return res.status(500).json({ error: "Failed to create page: " + error.message });
  }
});

// PUT /api/pages/:id (Admin)
router.put("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const { title, slug, content, status, metaTitle, metaDescription } = req.body;

    const updateRes = await query(`
      UPDATE pages SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        content = COALESCE($3, content),
        status = COALESCE($4, status),
        meta_title = COALESCE($5, meta_title),
        meta_description = COALESCE($6, meta_description),
        last_updated = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [title, slug, content, status, metaTitle, metaDescription, req.params.id]);

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    const r = updateRes.rows[0];
    return res.json({
      id: r.id,
      slug: r.slug,
      title: r.title,
      content: r.content,
      status: r.status,
      metaTitle: r.meta_title,
      metaDescription: r.meta_description,
      lastUpdated: r.last_updated,
    });
  } catch (error: any) {
    console.error("PUT page error:", error);
    return res.status(500).json({ error: "Failed to update page: " + error.message });
  }
});

// DELETE /api/pages/:id (Admin)
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const result = await query(`DELETE FROM pages WHERE id = $1`, [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Page not found" });
    }
    return res.json({ success: true, message: "Page deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to delete page: " + error.message });
  }
});

export default router;
