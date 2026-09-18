import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db/pool.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-accardio-jwt-key-2026";

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const adminRes = await query(`SELECT * FROM admins WHERE username = $1`, [username]);
    if (adminRes.rowCount === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = adminRes.rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        mustChangePassword: admin.must_change_password,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        username: admin.username,
        mustChangePassword: admin.must_change_password,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed: " + error.message });
  }
});

// GET /api/auth/session
router.get("/session", async (req: Request, res: Response) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.headers.cookie) {
    const cookies = Object.fromEntries(
      req.headers.cookie.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, decodeURIComponent(v.join("="))];
      })
    );
    token = cookies["admin_token"] || cookies["token"];
  }

  if (!token) {
    return res.json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const adminRes = await query(`SELECT id, username, must_change_password FROM admins WHERE id = $1`, [decoded.id]);
    if (adminRes.rowCount === 0) {
      return res.json({ authenticated: false });
    }
    const admin = adminRes.rows[0];
    return res.json({
      authenticated: true,
      user: {
        id: admin.id,
        username: admin.username,
      },
      mustChangePassword: admin.must_change_password,
    });
  } catch {
    return res.json({ authenticated: false });
  }
});

// POST /api/auth/logout
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("admin_token");
  return res.json({ success: true, message: "Logged out successfully" });
});

// POST /api/auth/change-password
router.post("/change-password", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required" });
    }

    const adminRes = await query(`SELECT * FROM admins WHERE id = $1`, [req.user?.id]);
    if (adminRes.rowCount === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const admin = adminRes.rows[0];
    const match = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!match) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await query(
      `UPDATE admins SET password_hash = $1, must_change_password = false, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [newHash, admin.id]
    );

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to update password: " + error.message });
  }
});

export default router;
