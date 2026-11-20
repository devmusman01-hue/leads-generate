import { NextResponse } from "next/server";
import { checkAgentKey } from "./auth";

export function unauthorized() {
  return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
}
export function guard(req: Request) {
  return checkAgentKey(req) ? null : unauthorized();
}
