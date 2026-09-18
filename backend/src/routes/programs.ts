import { Router, Request, Response } from "express";
import { query } from "../db/pool.js";
import { store } from "../db/store.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

function toApiProgram(program: any) {
  return {
    id: program.id,
    name: program.name || program.title,
    title: program.title || program.name,
    category: program.category,
    tag: program.tag,
    description: program.description || program.desc || "",
    desc: program.desc || program.description || "",
    eligibility: program.eligibility || "",
    benefits: Array.isArray(program.benefits) ? program.benefits : [],
    date: program.date || program.startDate || "",
    location: program.location || "",
    featuredImagePath: program.featuredImagePath || program.imagePath || "",
    active: program.active !== false,
    createdAt: program.createdAt || null,
  };
}

// GET /api/programs (Public)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    let sql = `SELECT * FROM programs WHERE active = true`;
    const params: any[] = [];

    if (category && category !== "all") {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length} OR tag ILIKE $${params.length})`;
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await query(sql, params);
    const programs = result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      title: r.name,
      category: r.category,
      tag: r.tag,
      description: r.description,
      desc: r.description,
      eligibility: r.eligibility,
      benefits: Array.isArray(r.benefits) ? r.benefits : typeof r.benefits === "string" ? JSON.parse(r.benefits) : [],
      date: r.date,
      location: r.location,
      featuredImagePath: r.featured_image_path,
      active: r.active,
      createdAt: r.created_at,
    }));

    return res.json(programs);
  } catch (error: any) {
    console.error("GET programs error:", error);
    const { category, search } = req.query;
    const searchText = String(search || "").toLowerCase();
    const programs = store.get("programs")
      .filter((program) => category === undefined || category === "all" || program.category === category)
      .filter((program) => !searchText || `${program.title} ${program.desc} ${program.tag}`.toLowerCase().includes(searchText))
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(toApiProgram);
    return res.json(programs);
  }
});

// GET /api/programs/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await query(`SELECT * FROM programs WHERE id = $1`, [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Program not found" });
    }
    const r = result.rows[0];
    return res.json({
      id: r.id,
      name: r.name,
      category: r.category,
      tag: r.tag,
      description: r.description,
      eligibility: r.eligibility,
      benefits: Array.isArray(r.benefits) ? r.benefits : [],
      date: r.date,
      location: r.location,
      featuredImagePath: r.featured_image_path,
      active: r.active,
      createdAt: r.created_at,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/programs (Admin)
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const {
      name,
      category = "exchange",
      tag = "Academic Exchange",
      description = "",
      eligibility = "",
      benefits = [],
      date = "",
      location = "",
      featuredImagePath = "",
      active = true,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Program name is required" });
    }

    const benefitsJson = JSON.stringify(Array.isArray(benefits) ? benefits : []);

    const insertRes = await query(`
      INSERT INTO programs (
        name, category, tag, description, eligibility, benefits, date, location, featured_image_path, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [name, category, tag, description, eligibility, benefitsJson, date, location, featuredImagePath, active]);

    const r = insertRes.rows[0];
    return res.status(201).json({
      id: r.id,
      name: r.name,
      category: r.category,
      tag: r.tag,
      description: r.description,
      eligibility: r.eligibility,
      benefits: Array.isArray(r.benefits) ? r.benefits : [],
      date: r.date,
      location: r.location,
      featuredImagePath: r.featured_image_path,
      active: r.active,
      createdAt: r.created_at,
    });
  } catch (error: any) {
    console.error("POST programs error:", error);
    const body = req.body;
    if (!body.name) return res.status(400).json({ error: "Program name is required" });
    const programs = store.get("programs");
    const program = {
      id: crypto.randomUUID(),
      title: body.name,
      category: body.category || "exchange",
      tag: body.tag || "Academic Exchange",
      desc: body.description || "",
      eligibility: body.eligibility || "",
      benefits: Array.isArray(body.benefits) ? body.benefits : [],
      location: body.location || "",
      startDate: body.date || "",
      imagePath: body.featuredImagePath || "",
      displayOrder: programs.length + 1,
    };
    store.set("programs", [...programs, program]);
    return res.status(201).json(toApiProgram(program));
  }
});

// PUT /api/programs/:id (Admin)
router.put("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      tag,
      description,
      eligibility,
      benefits,
      date,
      location,
      featuredImagePath,
      active,
    } = req.body;

    const benefitsJson = benefits ? JSON.stringify(Array.isArray(benefits) ? benefits : []) : undefined;

    const updateRes = await query(`
      UPDATE programs SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        tag = COALESCE($3, tag),
        description = COALESCE($4, description),
        eligibility = COALESCE($5, eligibility),
        benefits = COALESCE($6::jsonb, benefits),
        date = COALESCE($7, date),
        location = COALESCE($8, location),
        featured_image_path = COALESCE($9, featured_image_path),
        active = COALESCE($10, active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `, [name, category, tag, description, eligibility, benefitsJson, date, location, featuredImagePath, active, req.params.id]);

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ error: "Program not found" });
    }

    const r = updateRes.rows[0];
    return res.json({
      id: r.id,
      name: r.name,
      category: r.category,
      tag: r.tag,
      description: r.description,
      eligibility: r.eligibility,
      benefits: Array.isArray(r.benefits) ? r.benefits : [],
      date: r.date,
      location: r.location,
      featuredImagePath: r.featured_image_path,
      active: r.active,
      createdAt: r.created_at,
    });
  } catch (error: any) {
    console.error("PUT program error:", error);
    const programs = store.get("programs");
    const index = programs.findIndex((program) => String(program.id) === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Program not found" });
    const body = req.body;
    const current = programs[index];
    const updated = {
      ...current,
      title: body.name ?? current.title,
      category: body.category ?? current.category,
      tag: body.tag ?? current.tag,
      desc: body.description ?? current.desc,
      eligibility: body.eligibility ?? current.eligibility,
      benefits: Array.isArray(body.benefits) ? body.benefits : current.benefits,
      location: body.location ?? current.location,
      startDate: body.date ?? current.startDate,
      imagePath: body.featuredImagePath ?? current.imagePath,
    };
    programs[index] = updated;
    store.set("programs", programs);
    return res.json(toApiProgram(updated));
  }
});

// DELETE /api/programs/:id (Admin)
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const result = await query(`DELETE FROM programs WHERE id = $1`, [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Program not found" });
    }
    return res.json({ success: true, message: "Program deleted successfully" });
  } catch (error: any) {
    const programs = store.get("programs");
    const filtered = programs.filter((program) => String(program.id) !== req.params.id);
    if (filtered.length === programs.length) return res.status(404).json({ error: "Program not found" });
    store.set("programs", filtered);
    return res.json({ success: true, message: "Program deleted successfully" });
  }
});

export default router;
