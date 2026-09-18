import { Router, Request, Response } from "express";
import { query } from "../db/pool.js";
import { store } from "../db/store.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

function toApiTestimonial(item: any) {
  return {
    ...item,
    name: item.name || item.author,
    author: item.author || item.name,
    photoPath: item.photoPath || "",
    active: item.active !== false,
  };
}

function toApiVideo(item: any) {
  return { ...item, details: item.details || `${item.role || ""}${item.organization ? ` at ${item.organization}` : ""}`.trim() };
}

router.get("/video", (_req: Request, res: Response) => {
  return res.json([...store.get("videoTestimonials")].sort((a, b) => a.displayOrder - b.displayOrder).map(toApiVideo));
});

router.post("/video", authenticate, (req: Request, res: Response) => {
  const videos = store.get("videoTestimonials");
  const body = req.body;
  if (!body.title || !body.speaker) return res.status(400).json({ error: "Title and speaker are required" });
  const video = {
    id: crypto.randomUUID(),
    title: body.title,
    speaker: body.speaker,
    role: body.role || "",
    organization: body.organization || "",
    details: body.details || "",
    duration: body.duration || "",
    videoUrl: body.videoUrl || "",
    thumbnailPath: body.thumbnailPath || "",
    category: body.category || "academic",
    quote: body.quote || "",
    displayOrder: videos.length + 1,
  };
  store.set("videoTestimonials", [...videos, video]);
  return res.status(201).json(toApiVideo(video));
});

router.put("/video/:id", authenticate, (req: Request, res: Response) => {
  const videos = store.get("videoTestimonials");
  const index = videos.findIndex((item) => String(item.id) === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Video testimonial not found" });
  videos[index] = { ...videos[index], ...req.body, id: videos[index].id };
  store.set("videoTestimonials", videos);
  return res.json(toApiVideo(videos[index]));
});

router.delete("/video/:id", authenticate, (req: Request, res: Response) => {
  const videos = store.get("videoTestimonials");
  const filtered = videos.filter((item) => String(item.id) !== req.params.id);
  if (filtered.length === videos.length) return res.status(404).json({ error: "Video testimonial not found" });
  store.set("videoTestimonials", filtered);
  return res.json({ success: true });
});

// GET /api/testimonials (Public & Admin)
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM testimonials WHERE active = true ORDER BY display_order ASC, created_at DESC`
    );

    const items = result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      author: r.name,
      role: r.role,
      quote: r.quote,
      photoPath: r.photo_path,
      rating: r.rating,
      program: r.program,
      region: r.region,
      displayOrder: r.display_order,
      active: r.active,
      createdAt: r.created_at,
    }));

    return res.json(items);
  } catch (error: any) {
    console.error("GET testimonials error:", error);
    return res.json(store.get("testimonials").sort((a, b) => a.displayOrder - b.displayOrder).map(toApiTestimonial));
  }
});

// POST /api/testimonials (Admin)
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const {
      name,
      role = "",
      quote,
      photoPath = "",
      rating = 5,
      program = "general",
      region = "Global",
    } = req.body;

    if (!name || !quote) {
      return res.status(400).json({ error: "Name and quote are required" });
    }

    const maxOrderRes = await query(`SELECT COALESCE(MAX(display_order), 0) as max_order FROM testimonials`);
    const nextOrder = (maxOrderRes.rows[0].max_order || 0) + 1;

    const insertRes = await query(`
      INSERT INTO testimonials (
        name, role, quote, photo_path, rating, program, region, display_order, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      RETURNING *
    `, [name, role, quote, photoPath, rating, program, region, nextOrder]);

    const r = insertRes.rows[0];
    return res.status(201).json({
      id: r.id,
      name: r.name,
      role: r.role,
      quote: r.quote,
      photoPath: r.photo_path,
      rating: r.rating,
      program: r.program,
      region: r.region,
      displayOrder: r.display_order,
      active: r.active,
      createdAt: r.created_at,
    });
  } catch (error: any) {
    console.error("POST testimonial error:", error);
    const body = req.body;
    if (!body.name || !body.quote) return res.status(400).json({ error: "Name and quote are required" });
    const testimonials = store.get("testimonials");
    const item = {
      id: crypto.randomUUID(),
      author: body.name,
      name: body.name,
      role: body.role || "",
      quote: body.quote,
      photoPath: body.photoPath || "",
      rating: body.rating || 5,
      category: body.category || body.program || "general",
      program: body.program || "general",
      region: body.region || "Global",
      displayOrder: testimonials.length + 1,
    };
    store.set("testimonials", [...testimonials, item]);
    return res.status(201).json(toApiTestimonial(item));
  }
});

// PUT /api/testimonials/:id (Admin)
router.put("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const { name, role, quote, photoPath, rating, program, region, displayOrder, active } = req.body;

    const updateRes = await query(`
      UPDATE testimonials SET
        name = COALESCE($1, name),
        role = COALESCE($2, role),
        quote = COALESCE($3, quote),
        photo_path = COALESCE($4, photo_path),
        rating = COALESCE($5, rating),
        program = COALESCE($6, program),
        region = COALESCE($7, region),
        display_order = COALESCE($8, display_order),
        active = COALESCE($9, active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `, [name, role, quote, photoPath, rating, program, region, displayOrder, active, req.params.id]);

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    const r = updateRes.rows[0];
    return res.json({
      id: r.id,
      name: r.name,
      role: r.role,
      quote: r.quote,
      photoPath: r.photo_path,
      rating: r.rating,
      program: r.program,
      region: r.region,
      displayOrder: r.display_order,
      active: r.active,
      createdAt: r.created_at,
    });
  } catch (error: any) {
    console.error("PUT testimonial error:", error);
    const testimonials = store.get("testimonials");
    const index = testimonials.findIndex((item) => String(item.id) === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Testimonial not found" });
    testimonials[index] = { ...testimonials[index], ...req.body, id: testimonials[index].id };
    store.set("testimonials", testimonials);
    return res.json(toApiTestimonial(testimonials[index]));
  }
});

// DELETE /api/testimonials/:id (Admin)
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const result = await query(`DELETE FROM testimonials WHERE id = $1`, [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Testimonial not found" });
    }
    return res.json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error: any) {
    const testimonials = store.get("testimonials");
    const filtered = testimonials.filter((item) => String(item.id) !== req.params.id);
    if (filtered.length === testimonials.length) return res.status(404).json({ error: "Testimonial not found" });
    store.set("testimonials", filtered);
    return res.json({ success: true, message: "Testimonial deleted successfully" });
  }
});

export default router;
