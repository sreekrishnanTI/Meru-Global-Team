import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { checkConnection, reconfigurePool, testNewConnection } from "../db/pool.js";
import { runMigrations } from "../db/migrate.js";

const router = Router();

// GET /api/health
router.get("/", async (req: Request, res: Response) => {
  const dbStatus = await checkConnection();
  return res.json({
    status: "ok",
    service: "accadio-backend",
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.connected,
      version: dbStatus.version,
      name: dbStatus.database,
      error: dbStatus.error,
    },
  });
});

// POST /api/health/test-db
router.post("/test-db", async (req: Request, res: Response) => {
  const { host, port, user, password, database } = req.body;
  const result = await testNewConnection({
    host,
    port: port ? parseInt(port, 10) : undefined,
    user,
    password,
    database,
  });

  return res.json(result);
});

// POST /api/health/save-db-config
router.post("/save-db-config", async (req: Request, res: Response) => {
  try {
    const { host, port, user, password, database } = req.body;

    const envPath = path.resolve(process.cwd(), ".env");
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";

    const h = host || "localhost";
    const p = String(port || "5432");
    const u = user || "postgres";
    const pass = password || "";
    const d = database || "accardio";

    const connectionTest = await testNewConnection({
      host: h,
      port: parseInt(p, 10),
      user: u,
      password: pass,
      database: d,
    });
    if (!connectionTest.success) {
      return res.status(400).json({
        success: false,
        message: `Database connection failed: ${connectionTest.error}`,
      });
    }

    // Update or append variables
    const updateVar = (content: string, key: string, val: string) => {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(content)) {
        return content.replace(regex, `${key}=${val}`);
      }
      return content + `\n${key}=${val}`;
    };

    envContent = updateVar(envContent, "DB_HOST", h);
    envContent = updateVar(envContent, "DB_PORT", p);
    envContent = updateVar(envContent, "DB_USER", u);
    envContent = updateVar(envContent, "DB_PASSWORD", pass);
    envContent = updateVar(envContent, "DB_NAME", d);
    envContent = updateVar(
      envContent,
      "DATABASE_URL",
      `postgresql://${encodeURIComponent(u)}:${encodeURIComponent(pass)}@${h}:${p}/${d}`
    );

    fs.writeFileSync(envPath, envContent, "utf-8");

    // Update current process.env
    process.env.DB_HOST = h;
    process.env.DB_PORT = p;
    process.env.DB_USER = u;
    process.env.DB_PASSWORD = pass;
    process.env.DB_NAME = d;
    process.env.DATABASE_URL = `postgresql://${encodeURIComponent(u)}:${encodeURIComponent(pass)}@${h}:${p}/${d}`;

    await reconfigurePool({
      host: h,
      port: parseInt(p, 10),
      user: u,
      password: pass,
      database: d,
    });

    // Try migrations with new credentials
    try {
      await runMigrations();
      return res.json({
        success: true,
        message: "Database credentials saved and migrations executed successfully!",
      });
    } catch (migErr: any) {
      return res.json({
        success: false,
        message: "Credentials saved, but migration failed: " + migErr.message,
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to update configuration: " + err.message });
  }
});

export default router;
