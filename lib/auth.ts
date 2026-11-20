import crypto from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE = "lg_session";

export function sessionToken() {
  const pw = process.env.DASHBOARD_PASSWORD ?? "";
  const secret = process.env.AUTH_SECRET ?? "dev-secret";
  return crypto.createHmac("sha256", secret).update(pw).digest("hex");
}

export function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

export async function isAuthed() {
  if (!process.env.DASHBOARD_PASSWORD) return false;
  const c = (await cookies()).get(COOKIE)?.value;
  return !!c && safeEqual(c, sessionToken());
}

export function checkAgentKey(req: Request) {
  const key = process.env.AGENT_API_KEY;
  if (!key) return false;
  const h = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? req.headers.get("x-api-key") ?? "";
  return safeEqual(h, key);
}
