import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { UPLOADS_DIR } from "./middleware/upload.js";
import { runMigrations } from "./db/migrate.js";

// Routes
import authRouter from "./routes/auth.js";
import homepageRouter from "./routes/homepage.js";
import programsRouter from "./routes/programs.js";
import testimonialsRouter from "./routes/testimonials.js";
import mediaRouter from "./routes/media.js";
import pagesRouter from "./routes/pages.js";
import contactRouter from "./routes/contact.js";
import dashboardRouter from "./routes/dashboard.js";
import healthRouter from "./routes/health.js";
import historyRouter from "./routes/history.js";
import newsRouter from "./routes/news.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// CORS Configuration
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Body Parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static uploads serving
app.use("/uploads", express.static(UPLOADS_DIR));

// Request logging in development
if (process.env.NODE_ENV !== "test") {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// Health check
app.use("/api/health", healthRouter);

// Main API Routes
app.use("/api/auth", authRouter);
app.use("/api/homepage", homepageRouter);
app.use("/api/programs", programsRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/history", historyRouter);
app.use("/api/news", newsRouter);
app.use("/api/media", mediaRouter);
app.use("/api/pages", pagesRouter);
app.use("/api/contact", contactRouter);
app.use("/api/dashboard", dashboardRouter);

// Admin Aliases for seamless compatibility
app.use("/api/admin/auth", authRouter);
app.use("/api/admin/health", healthRouter);
app.use("/api/admin/homepage", homepageRouter);
app.use("/api/admin/programs", programsRouter);
app.use("/api/admin/testimonials", testimonialsRouter);
app.use("/api/admin/history", historyRouter);
app.use("/api/admin/news", newsRouter);
app.use("/api/admin/media", mediaRouter);
app.use("/api/admin/pages", pagesRouter);
app.use("/api/admin/contact", contactRouter);
app.use("/api/admin/dashboard", dashboardRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Not Found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server Global Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// Start Server & Run DB Migrations
app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 Accadio PostgreSQL Backend running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📁 Uploads dir: ${UPLOADS_DIR}`);
  console.log(`=======================================================`);

  try {
    await runMigrations();
    console.log("✓ Database successfully connected and initialized!");
  } catch (err: any) {
    console.error("⚠️ PostgreSQL auto-migration notice:", err.message);
    console.log("👉 Tip: Verify DATABASE_URL or DB credentials in Accadio/backend/.env");
  }
});

export default app;
