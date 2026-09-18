import { Router, Request, Response } from "express";
import { query, checkConnection } from "../db/pool.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const [
      photosRes,
      videosRes,
      pagesRes,
      programsRes,
      testimonialsRes,
      inquiriesRes,
      lastHomeRes,
      dbStatus,
    ] = await Promise.all([
      query(`SELECT COUNT(*) FROM media WHERE file_type = 'image'`),
      query(`SELECT COUNT(*) FROM media WHERE file_type = 'video'`),
      query(`SELECT COUNT(*) FROM pages`),
      query(`SELECT COUNT(*) FROM programs`),
      query(`SELECT COUNT(*) FROM testimonials`),
      query(`SELECT COUNT(*) FROM inquiries WHERE status = 'unread'`),
      query(`SELECT updated_at FROM homepage_settings WHERE id = 'main'`),
      checkConnection(),
    ]);

    const photos = parseInt(photosRes.rows[0]?.count || "0", 10);
    const videos = parseInt(videosRes.rows[0]?.count || "0", 10);
    const totalPages = parseInt(pagesRes.rows[0]?.count || "0", 10);
    const programs = parseInt(programsRes.rows[0]?.count || "0", 10);
    const testimonials = parseInt(testimonialsRes.rows[0]?.count || "0", 10);
    const unreadInquiries = parseInt(inquiriesRes.rows[0]?.count || "0", 10);
    const lastUpdated = lastHomeRes.rows[0]?.updated_at || new Date().toISOString();

    return res.json({
      photos,
      videos,
      totalPages,
      programs,
      testimonials,
      unreadInquiries,
      lastUpdated,
      database: {
        connected: dbStatus.connected,
        version: dbStatus.version,
        name: dbStatus.database,
        error: dbStatus.error,
      },
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ error: "Failed to fetch dashboard stats: " + error.message });
  }
});

export default router;
