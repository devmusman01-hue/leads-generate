import { NextResponse } from "next/server";
import { Binary } from "mongodb";
import { isAuthed } from "@/lib/auth";
import { extractText, findPlaceholders, getTemplate, templateCol } from "@/lib/template";

const MAX = 4 * 1024 * 1024; // Vercel rejects request bodies over ~4.5 MB

export async function GET() {
  if (!(await isAuthed())) return new NextResponse("Unauthorized", { status: 401 });
  const t = await getTemplate();
  if (!t?.data) return new NextResponse("No template", { status: 404 });
  return new NextResponse(new Uint8Array(t.data.buffer), {
    headers: {
      "Content-Type": t.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${t.filename}"`,
    },
  });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Not logged in. Refresh and sign in again." }, { status: 401 });
  try {
    const file = (await req.formData()).get("file");
    if (!file || typeof file === "string" || file.size === 0) return NextResponse.json({ error: "Choose a file first." }, { status: 400 });
    if (file.size > MAX) return NextResponse.json({ error: "File is larger than 4 MB." }, { status: 400 });
    const buf = Buffer.from(await file.arrayBuffer());
    const text = await extractText(file.name, buf);
    const res = await (await templateCol()).updateOne(
      { _id: "current" as never },
      {
        $set: {
          filename: file.name,
          contentType: file.type,
          size: file.size,
          data: new Binary(buf),
          text,
          placeholders: findPlaceholders(text),
          uploadedAt: new Date(),
        },
      },
      { upsert: true },
    );
    if (!res.acknowledged) throw new Error("Database did not acknowledge the write");
    return NextResponse.json({ ok: true, filename: file.name, extracted: text.length > 0 });
  } catch (e) {
    console.error("[template upload]", e);
    return NextResponse.json({ error: `Upload failed: ${e instanceof Error ? e.message : "unknown error"}` }, { status: 500 });
  }
}
