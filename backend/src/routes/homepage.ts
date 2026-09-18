import { Router, Request, Response } from "express";
import { query } from "../db/pool.js";
import { store, StoreSchema } from "../db/store.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Helper to fetch consolidated homepage data
async function getHomepageData() {
  try {
    const settingsRes = await query(`SELECT * FROM homepage_settings WHERE id = 'main' LIMIT 1`);
    const tickerRes = await query(`SELECT * FROM ticker_items WHERE active = true ORDER BY display_order ASC, created_at ASC`);
    const statsRes = await query(`SELECT * FROM home_stats ORDER BY display_order ASC, created_at ASC`);
    const valuesRes = await query(`SELECT * FROM home_values ORDER BY display_order ASC, created_at ASC`);

    const s = settingsRes.rows[0] || {};

    return {
      heroTitle: s.hero_title || "Reaching the Unreached",
      heroSubtitle: s.hero_subtitle || "Connecting generations to the Great Commission",
      heroImagePath: s.hero_image_path || "",
      heroVideoUrl: s.hero_video_url || "",
      logoRotation: s.logo_rotation !== false,
      aboutTitle: s.about_title || "Reaching the Unreached, Connecting generations to the great commission.",
      aboutSubtitle: s.about_subtitle || "ABOUT US",
      aboutOverview: s.about_overview || "Through our dedicated programs and global network, we bridge geographical and cultural gaps to bring hope and community transformation.",
      aboutMissionTitle: s.about_mission_title || "Our Mission",
      aboutMissionText: s.about_mission_text || "To mobilize, equip, and commission youth and professionals across nations.",
      aboutVisionTitle: s.about_vision_title || "Our Vision",
      aboutVisionText: s.about_vision_text || "A connected global community empowered by sustainable leadership and education.",
      donationTitle: s.donation_title || "Help Meru reach more communities",
      donationSubtitle: s.donation_subtitle || "Your contribution supports global exchange access, youth leadership programs, and outreach for learners and communities who need opportunity most.",
      tickerItems: tickerRes.rows.map((r) => ({
        id: r.id,
        label: r.label,
        date: r.date,
        text: r.text,
        color: r.color,
        displayOrder: r.display_order,
        active: r.active,
      })),
      stats: statsRes.rows.map((r) => ({
        id: r.id,
        target: r.target_number,
        suffix: r.suffix,
        label: r.label,
        displayOrder: r.display_order,
      })),
      values: valuesRes.rows.map((r) => ({
        id: r.id,
        title: r.title,
        desc: r.description,
        icon: r.icon_name,
        displayOrder: r.display_order,
      })),
      lastUpdated: s.updated_at || new Date().toISOString(),
    };
  } catch (error: any) {
    console.warn("Using file-backed homepage store:", error.message);
    return store.get("homepage");
  }
}

// GET /api/homepage (Public & Admin)
router.get("/", async (req: Request, res: Response) => {
  try {
    const data = await getHomepageData();
    return res.json(data);
  } catch (error: any) {
    console.error("GET homepage error:", error);
    return res.status(500).json({ error: "Failed to load homepage data: " + error.message });
  }
});

// PUT /api/homepage (Admin)
router.put("/", authenticate, async (req: Request, res: Response) => {
  try {
    const {
      heroTitle,
      heroSubtitle,
      heroImagePath,
      heroVideoUrl,
      logoRotation,
      aboutTitle,
      aboutSubtitle,
      aboutOverview,
      aboutMissionTitle,
      aboutMissionText,
      aboutVisionTitle,
      aboutVisionText,
      donationTitle,
      donationSubtitle,
      tickerItems,
      stats,
      values,
    } = req.body;

    const fallbackHomepage: StoreSchema["homepage"] = {
      ...store.get("homepage"),
      ...req.body,
      tickerItems: Array.isArray(tickerItems) ? tickerItems : store.get("homepage").tickerItems,
      stats: Array.isArray(stats) ? stats : store.get("homepage").stats,
      values: Array.isArray(values) ? values : store.get("homepage").values,
      lastUpdated: new Date().toISOString(),
    };

    try {
      await query(`
      INSERT INTO homepage_settings (
        id, hero_title, hero_subtitle, hero_image_path, hero_video_url, logo_rotation,
        about_title, about_subtitle, about_overview, about_mission_title, about_mission_text,
        about_vision_title, about_vision_text, donation_title, donation_subtitle, updated_at
      ) VALUES (
        'main', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        hero_title = COALESCE($1, homepage_settings.hero_title),
        hero_subtitle = COALESCE($2, homepage_settings.hero_subtitle),
        hero_image_path = COALESCE($3, homepage_settings.hero_image_path),
        hero_video_url = COALESCE($4, homepage_settings.hero_video_url),
        logo_rotation = COALESCE($5, homepage_settings.logo_rotation),
        about_title = COALESCE($6, homepage_settings.about_title),
        about_subtitle = COALESCE($7, homepage_settings.about_subtitle),
        about_overview = COALESCE($8, homepage_settings.about_overview),
        about_mission_title = COALESCE($9, homepage_settings.about_mission_title),
        about_mission_text = COALESCE($10, homepage_settings.about_mission_text),
        about_vision_title = COALESCE($11, homepage_settings.about_vision_title),
        about_vision_text = COALESCE($12, homepage_settings.about_vision_text),
        donation_title = COALESCE($13, homepage_settings.donation_title),
        donation_subtitle = COALESCE($14, homepage_settings.donation_subtitle),
        updated_at = CURRENT_TIMESTAMP;
      `, [
        heroTitle,
        heroSubtitle,
        heroImagePath,
        heroVideoUrl,
        logoRotation,
        aboutTitle,
        aboutSubtitle,
        aboutOverview,
        aboutMissionTitle,
        aboutMissionText,
        aboutVisionTitle,
        aboutVisionText,
        donationTitle,
        donationSubtitle,
      ]);

      // Update ticker items if provided
      if (Array.isArray(tickerItems)) {
        // Clear and reinsert or sync
        await query(`DELETE FROM ticker_items`);
        for (let i = 0; i < tickerItems.length; i++) {
          const item = tickerItems[i];
          await query(`
          INSERT INTO ticker_items (label, date, text, color, display_order, active)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
            item.label || "NEWS",
            item.date || "TODAY",
            item.text || "",
            item.color || "blue",
            i + 1,
            item.active !== false,
          ]);
        }
      }

      // Update stats counters if provided
      if (Array.isArray(stats)) {
        await query(`DELETE FROM home_stats`);
        for (let i = 0; i < stats.length; i++) {
          const s = stats[i];
          await query(`
          INSERT INTO home_stats (target_number, suffix, label, display_order)
          VALUES ($1, $2, $3, $4)
        `, [
            parseInt(s.target || s.count || 0, 10),
            s.suffix || "+",
            s.label || "Metric",
            i + 1,
          ]);
        }
      }

      // Update core values if provided
      if (Array.isArray(values)) {
        await query(`DELETE FROM home_values`);
        for (let i = 0; i < values.length; i++) {
          const v = values[i];
          await query(`
          INSERT INTO home_values (title, description, icon_name, display_order)
          VALUES ($1, $2, $3, $4)
        `, [
            v.title,
            v.desc || v.description,
            v.icon || "Award",
            i + 1,
          ]);
        }
      }

      const updated = await getHomepageData();
      return res.json({ success: true, message: "Homepage updated successfully", data: updated });
    } catch (error: any) {
      console.warn("Saving homepage to file-backed store:", error.message);
      store.set("homepage", fallbackHomepage);
      return res.json({ success: true, message: "Homepage saved to file-backed store", data: fallbackHomepage });
    }
  } catch (error: any) {
    console.error("PUT homepage error:", error);
    return res.status(500).json({ error: "Failed to update homepage: " + error.message });
  }
});

// Ticker CRUD
router.post("/ticker", authenticate, async (req: Request, res: Response) => {
  try {
    const { label, date, text, color } = req.body;
    const maxOrderRes = await query(`SELECT COALESCE(MAX(display_order), 0) as max_order FROM ticker_items`);
    const nextOrder = (maxOrderRes.rows[0].max_order || 0) + 1;

    const insertRes = await query(`
      INSERT INTO ticker_items (label, date, text, color, display_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [label || "NEWS", date, text, color || "blue", nextOrder]);

    return res.status(201).json(insertRes.rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/ticker/:id", authenticate, async (req: Request, res: Response) => {
  try {
    await query(`DELETE FROM ticker_items WHERE id = $1`, [req.params.id]);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
