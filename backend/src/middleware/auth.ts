import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-accardio-jwt-key-2026";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    mustChangePassword?: boolean;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
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
    return res.status(401).json({ error: "Unauthorized: Access token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
      mustChangePassword?: boolean;
    };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

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

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
    } catch {
      // Ignore invalid token for optional auth
    }
  }

  next();
}
