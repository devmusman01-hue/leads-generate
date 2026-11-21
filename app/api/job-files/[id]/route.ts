import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { fileId, filesCol } from "@/lib/job-files";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return new NextResponse("Unauthorized", { status: 401 });
  const _id = fileId((await ctx.params).id);
  const f = _id && (await (await filesCol()).findOne({ _id }));
  if (!f) return new NextResponse("Not found", { status: 404 });
  const inline = /^image\/(png|jpe?g|gif|webp)$/.test(f.contentType) || f.contentType === "application/pdf";
  return new NextResponse(new Uint8Array(f.data.buffer), {
    headers: {
      "Content-Type": f.contentType,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${String(f.name).replace(/"/g, "")}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
