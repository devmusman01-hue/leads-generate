import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { jobsCol, oid } from "@/lib/jobs";
import { MAX_TOTAL, fileId, filesCol, pickFiles, storeFiles, text } from "@/lib/job-files";

const err = (error: string, status = 400) => NextResponse.json({ error }, { status });

// Save (or replace) the customised CV for one job. Allowed at ANY stage.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return err("Not logged in. Refresh and sign in again.", 401);
  try {
    const { id } = await ctx.params;
    const _id = oid(id);
    const col = await jobsCol();
    const job = _id && (await col.findOne({ _id }));
    if (!_id || !job) return err("Job not found.", 404);

    const fd = await req.formData();
    const files = pickFiles(fd, "file");
    const cvText = text(fd, "text");
    let link = text(fd, "link");
    const note = text(fd, "note");
    if (link && !/^https?:\/\//i.test(link)) link = `https://${link}`;

    if (!files.length && !cvText && !link) return err("Upload the CV file, paste the CV text, or add a link.");
    if (files.reduce((a, f) => a + f.size, 0) > MAX_TOTAL) return err("CV file is too large (max 4 MB).");

    const [file] = await storeFiles(id, "cv", files.slice(0, 1));
    const now = new Date();
    const cv = { file: file ?? null, text: cvText, link, note, at: now.toISOString() };
    await col.updateOne(
      { _id },
      {
        $set: { cv, updatedAt: now },
        $push: {
          history: { status: job.status, at: now, note: job.cv ? "Customised CV updated" : "Customised CV saved" },
          ...(job.cv ? { cvHistory: job.cv } : {}),
        },
      } as never,
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[save cv]", e);
    return err(`Failed: ${e instanceof Error ? e.message : "unknown error"}`, 500);
  }
}

// Download the current CV (file, or the saved text as a .txt).
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return new NextResponse("Unauthorized", { status: 401 });
  const _id = oid((await ctx.params).id);
  const job = _id && (await (await jobsCol()).findOne({ _id }));
  const cv = job?.cv;
  if (!job || !cv) return new NextResponse("No CV saved for this job", { status: 404 });

  if (cv.file) {
    const fid = fileId(cv.file.id);
    const f = fid && (await (await filesCol()).findOne({ _id: fid }));
    if (f) {
      return new NextResponse(new Uint8Array(f.data.buffer), {
        headers: {
          "Content-Type": f.contentType,
          "Content-Disposition": `attachment; filename="${String(f.name).replace(/"/g, "")}"`,
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
  }
  if (cv.text) {
    const name = `CV - ${String(job.title).replace(/[^\w\- ]+/g, "").slice(0, 60)}.txt`;
    return new NextResponse(cv.text, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"` },
    });
  }
  if (cv.link) return NextResponse.redirect(cv.link, 307);
  return new NextResponse("No CV saved for this job", { status: 404 });
}
