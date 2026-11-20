import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, safeEqual, sessionToken } from "@/lib/auth";

// Password gate for the dashboard. /api/agent/* uses its own API key; /login is public.
export function proxy(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (token && safeEqual(token, sessionToken())) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!login|api/agent|_next/static|_next/image|favicon.ico).*)"],
};
