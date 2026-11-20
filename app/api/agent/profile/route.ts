import { NextResponse } from "next/server";
import { guard } from "@/lib/agent";
import { getSections } from "@/lib/profile";
import { getFocus } from "@/lib/focus";

export async function GET(req: Request) {
  const denied = guard(req);
  if (denied) return denied;
  const [sections, focus] = await Promise.all([getSections(), getFocus()]);
  return NextResponse.json({ sections, focus });
}
