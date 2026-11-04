import type { NextFunction, Request, Response } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { adminUsersTable, db, type AdminUserRow } from "@workspace/db";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminUserRow;
    }
  }
}

const EMAIL_CACHE_TTL_MS = 5 * 60 * 1000;
const emailCache = new Map<string, { emails: string[]; expires: number }>();

async function verifiedEmailsFor(userId: string): Promise<string[]> {
  const cached = emailCache.get(userId);
  if (cached && cached.expires > Date.now()) return cached.emails;
  const user = await clerkClient.users.getUser(userId);
  const emails = user.emailAddresses
    .filter((e) => e.verification?.status === "verified")
    .map((e) => e.emailAddress.toLowerCase());
  emailCache.set(userId, { emails, expires: Date.now() + EMAIL_CACHE_TTL_MS });
  return emails;
}

async function adminForUser(userId: string): Promise<AdminUserRow | null> {
  const emails = await verifiedEmailsFor(userId);
  for (const email of emails) {
    const [admin] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email));
    if (admin) return admin;
  }
  return null;
}

/** The signed-in staff member, or null. Never writes a response. */
export async function adminFromRequest(req: Request): Promise<AdminUserRow | null> {
  const userId = getAuth(req)?.userId;
  return userId ? adminForUser(userId) : null;
}

async function resolveAdmin(req: Request, res: Response): Promise<AdminUserRow | null> {
  const userId = getAuth(req)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Sign in required" });
    return null;
  }
  const admin = await adminForUser(userId);
  if (!admin) res.status(403).json({ error: "This account does not have staff access" });
  return admin;
}

export function requireAdmin(role: "editor" | "owner" = "editor") {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admin = await resolveAdmin(req, res);
      if (!admin) return;
      if (role === "owner" && admin.role !== "owner") {
        res.status(403).json({ error: "Owner access required" });
        return;
      }
      req.admin = admin;
      next();
    } catch (err) {
      next(err);
    }
  };
}
