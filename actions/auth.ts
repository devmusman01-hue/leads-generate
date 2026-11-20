"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, safeEqual, sessionToken } from "@/lib/auth";

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const pw = String(formData.get("password") ?? "");
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) return { error: "DASHBOARD_PASSWORD is not set in .env.local" };
  if (!safeEqual(pw, expected)) return { error: "Wrong password" };
  (await cookies()).set(COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/dashboard");
}

export async function logout() {
  (await cookies()).delete(COOKIE);
  redirect("/login");
}
