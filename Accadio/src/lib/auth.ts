// import bcrypt from "bcryptjs";
// import { v4 as uuidv4 } from "uuid";
// import { readData, writeData } from "./db";

// // ── Types ──
// export interface AdminUser {
//   id: string;
//   username: string;
//   passwordHash: string;
//   mustChangePassword: boolean;
//   createdAt: string;
// }

// export interface Session {
//   token: string;
//   adminId: string;
//   createdAt: string;
//   lastActivity: string;
//   expiresAt: string;
// }

// // ── Constants ──
// const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes
// const SALT_ROUNDS = 12;

// // ── Password Utilities ──
// export async function hashPassword(plain: string): Promise<string> {
//   return bcrypt.hash(plain, SALT_ROUNDS);
// }

// export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
//   return bcrypt.compare(plain, hash);
// }

// // ── Admin User ──
// export function getAdmin(): AdminUser {
//   const admins = readData<AdminUser[]>("admin.json", []);
//   if (admins.length === 0) {
//     throw new Error("No admin user found");
//   }
//   return admins[0];
// }

// export function updateAdmin(updates: Partial<AdminUser>): AdminUser {
//   const admins = readData<AdminUser[]>("admin.json", []);
//   if (admins.length === 0) throw new Error("No admin user found");
//   const updated = { ...admins[0], ...updates };
//   writeData("admin.json", [updated]);
//   return updated;
// }

// // ── Session Management ──
// export function createSession(adminId: string): Session {
//   const sessions = readData<Session[]>("sessions.json", []);
//   const now = new Date();
//   const session: Session = {
//     token: uuidv4(),
//     adminId,
//     createdAt: now.toISOString(),
//     lastActivity: now.toISOString(),
//     expiresAt: new Date(now.getTime() + SESSION_DURATION_MS).toISOString(),
//   };
//   // Clean up old sessions and add new one
//   const activeSessions = sessions.filter(
//     (s) => new Date(s.expiresAt).getTime() > now.getTime()
//   );
//   activeSessions.push(session);
//   writeData("sessions.json", activeSessions);
//   return session;
// }

// export function validateSession(token: string): Session | null {
//   if (!token) return null;
//   const sessions = readData<Session[]>("sessions.json", []);
//   const now = new Date();
//   const session = sessions.find((s) => s.token === token);
//   if (!session) return null;
//   if (new Date(session.expiresAt).getTime() <= now.getTime()) {
//     // Session expired — remove it
//     destroySession(token);
//     return null;
//   }
//   // Refresh session expiry on activity
//   session.lastActivity = now.toISOString();
//   session.expiresAt = new Date(now.getTime() + SESSION_DURATION_MS).toISOString();
//   const updatedSessions = sessions.map((s) => (s.token === token ? session : s));
//   writeData("sessions.json", updatedSessions);
//   return session;
// }

// export function destroySession(token: string): void {
//   const sessions = readData<Session[]>("sessions.json", []);
//   const filtered = sessions.filter((s) => s.token !== token);
//   writeData("sessions.json", filtered);
// }

// // ── Auth Middleware Helper ──
// export function getSessionFromCookie(cookieHeader: string | null): Session | null {
//   if (!cookieHeader) return null;
//   const cookies = cookieHeader.split(";").reduce(
//     (acc, cookie) => {
//       const [key, val] = cookie.trim().split("=");
//       if (key && val) acc[key] = val;
//       return acc;
//     },
//     {} as Record<string, string>
//   );
//   const token = cookies["admin_session"];
//   if (!token) return null;
//   return validateSession(token);
// }



// -----------------------------NEWCODE-----------------------------



import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { readData, writeData } from "./db";

// ── Types ──
export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface Session {
  token: string;
  adminId: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
}

// ── Constants ──
const SESSION_DURATION_MS = 30 * 60 * 1000;
const SALT_ROUNDS = 12;

// ── Password Utilities ──
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── Legacy Admin User ──
// Kept for compatibility with older parts of the application.
export function getAdmin(): AdminUser {
  const admins = readData<AdminUser[]>("admin.json", []);

  if (admins.length === 0) {
    throw new Error("No admin user found");
  }

  return admins[0];
}

export function updateAdmin(
  updates: Partial<AdminUser>
): AdminUser {
  const admins = readData<AdminUser[]>("admin.json", []);

  if (admins.length === 0) {
    throw new Error("No admin user found");
  }

  const updated = {
    ...admins[0],
    ...updates,
  };

  writeData("admin.json", [updated]);

  return updated;
}

// ── Legacy Session Management ──
export function createSession(adminId: string): Session {
  const sessions = readData<Session[]>("sessions.json", []);

  const now = new Date();

  const session: Session = {
    token: uuidv4(),
    adminId,
    createdAt: now.toISOString(),
    lastActivity: now.toISOString(),
    expiresAt: new Date(
      now.getTime() + SESSION_DURATION_MS
    ).toISOString(),
  };

  const activeSessions = sessions.filter(
    (s) =>
      new Date(s.expiresAt).getTime() > now.getTime()
  );

  activeSessions.push(session);

  writeData("sessions.json", activeSessions);

  return session;
}

export function validateSession(
  token: string
): Session | null {
  if (!token) return null;

  const sessions = readData<Session[]>(
    "sessions.json",
    []
  );

  const now = new Date();

  const session = sessions.find(
    (s) => s.token === token
  );

  if (!session) return null;

  if (
    new Date(session.expiresAt).getTime() <=
    now.getTime()
  ) {
    destroySession(token);
    return null;
  }

  session.lastActivity = now.toISOString();

  session.expiresAt = new Date(
    now.getTime() + SESSION_DURATION_MS
  ).toISOString();

  const updatedSessions = sessions.map((s) =>
    s.token === token ? session : s
  );

  writeData("sessions.json", updatedSessions);

  return session;
}

export function destroySession(token: string): void {
  const sessions = readData<Session[]>(
    "sessions.json",
    []
  );

  const filtered = sessions.filter(
    (s) => s.token !== token
  );

  writeData("sessions.json", filtered);
}

// ── Auth Middleware Helper ──
// Supports the new JWT token stored in admin_token.
// Falls back to the old admin_session for compatibility.
export function getSessionFromCookie(
  cookieHeader: string | null
): Session | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce(
    (acc, cookie) => {
      const [key, val] = cookie.trim().split("=");

      if (key && val) {
        acc[key] = val;
      }

      return acc;
    },
    {} as Record<string, string>
  );

  // New JWT authentication
  const jwtToken = cookies["admin_token"];

  if (jwtToken) {
    return {
      token: jwtToken,
      adminId: "jwt-authenticated",
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
    };
  }

  // Old file-based authentication
  const legacyToken = cookies["admin_session"];

  if (!legacyToken) return null;

  return validateSession(legacyToken);
}