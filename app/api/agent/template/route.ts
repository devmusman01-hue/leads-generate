import { NextResponse } from "next/server";
import { guard } from "@/lib/agent";
import { getTemplate } from "@/lib/template";

export async function GET(req: Request) {
  const denied = guard(req);
  if (denied) return denied;
  const t = await getTemplate();
  if (!t?.data) return NextResponse.json({ error: "No template uploaded" }, { status: 404 });
  return new NextResponse(new Uint8Array(t.data.buffer), {
    headers: {
      "Content-Type": t.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${t.filename}"`,
    },
  });
}
