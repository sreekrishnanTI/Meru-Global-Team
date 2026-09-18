import { Router, Request, Response } from "express";
import { query } from "../db/pool.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// GET /api/contact (Public & Admin)
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await query(`SELECT * FROM contact_settings WHERE id = 'main' LIMIT 1`);
    const s = result.rows[0] || {};
    return res.json({
      phone: s.phone || "+1 (555) 123-4567",
      email: s.email || "connect@meruglobal.org",
      address: s.address || "MERU Global Team, International Office",
      officeHours: s.office_hours || "Mon - Fri: 9:00 AM - 6:00 PM",
      socialLinks: {
        facebook: s.facebook || "",
        twitter: s.twitter || "",
        instagram: s.instagram || "",
        linkedin: s.linkedin || "",
        youtube: s.youtube || "",
      },
      googleMapsEmbed: s.google_maps_embed || "",
      lastUpdated: s.updated_at || new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("GET contact error:", error);
    return res.status(500).json({ error: "Failed to fetch contact settings: " + error.message });
  }
});

// PUT /api/contact (Admin)
router.put("/", authenticate, async (req: Request, res: Response) => {
  try {
    const { phone, email, address, officeHours, socialLinks, googleMapsEmbed } = req.body;
    const sLinks = socialLinks || {};

    await query(`
      INSERT INTO contact_settings (
        id, phone, email, address, office_hours, facebook, twitter, instagram, linkedin, youtube, google_maps_embed, updated_at
      ) VALUES (
        'main', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        phone = COALESCE($1, contact_settings.phone),
        email = COALESCE($2, contact_settings.email),
        address = COALESCE($3, contact_settings.address),
        office_hours = COALESCE($4, contact_settings.office_hours),
        facebook = COALESCE($5, contact_settings.facebook),
        twitter = COALESCE($6, contact_settings.twitter),
        instagram = COALESCE($7, contact_settings.instagram),
        linkedin = COALESCE($8, contact_settings.linkedin),
        youtube = COALESCE($9, contact_settings.youtube),
        google_maps_embed = COALESCE($10, contact_settings.google_maps_embed),
        updated_at = CURRENT_TIMESTAMP;
    `, [
      phone,
      email,
      address,
      officeHours,
      sLinks.facebook || "",
      sLinks.twitter || "",
      sLinks.instagram || "",
      sLinks.linkedin || "",
      sLinks.youtube || "",
      googleMapsEmbed,
    ]);

    return res.json({ success: true, message: "Contact settings updated successfully" });
  } catch (error: any) {
    console.error("PUT contact error:", error);
    return res.status(500).json({ error: "Failed to update contact settings: " + error.message });
  }
});

// POST /api/contact/inquiries (Public website contact form submission)
router.post("/inquiries", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, department, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    const result = await query(`
      INSERT INTO inquiries (name, email, phone, department, message, status)
      VALUES ($1, $2, $3, $4, $5, 'unread')
      RETURNING *
    `, [name, email, phone || "", department || "general", message]);

    return res.status(201).json({
      success: true,
      message: "Thank you for contacting us. We will get back to you shortly.",
      inquiry: result.rows[0],
    });
  } catch (error: any) {
    console.error("POST inquiry error:", error);
    return res.status(500).json({ error: "Failed to submit inquiry: " + error.message });
  }
});

// GET /api/contact/inquiries (Admin inquiry inbox)
router.get("/inquiries", authenticate, async (req: Request, res: Response) => {
  try {
    const result = await query(`SELECT * FROM inquiries ORDER BY created_at DESC`);
    const inquiries = result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      department: r.department,
      message: r.message,
      status: r.status,
      createdAt: r.created_at,
    }));
    return res.json(inquiries);
  } catch (error: any) {
    console.error("GET inquiries error:", error);
    return res.status(500).json({ error: "Failed to fetch inquiries: " + error.message });
  }
});

// PUT /api/contact/inquiries/:id (Admin status update)
router.put("/inquiries/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const result = await query(
      `UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *`,
      [status || "read", req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Inquiry not found" });
    }
    return res.json(result.rows[0]);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/contact/inquiries/:id (Admin delete inquiry)
router.delete("/inquiries/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const result = await query(`DELETE FROM inquiries WHERE id = $1`, [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Inquiry not found" });
    }
    return res.json({ success: true, message: "Inquiry deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
