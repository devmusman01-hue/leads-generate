import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { jobsCol, oid, transition } from "@/lib/jobs";
import { MAX_TOTAL, parseFields, parseLinks, pickFiles, storeFiles, text, totalSize } from "@/lib/job-files";

const err = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return err("Not logged in. Refresh and sign in again.", 401);
  try {
    const { id } = await ctx.params;
    const _id = oid(id);
    const job = _id && (await (await jobsCol()).findOne({ _id }));
    if (!job) return err("Job not found.", 404);
    if (job.status !== "added") return err(`This job is already "${job.status}".`, 409);

    const fd = await req.formData();
    const notes = text(fd, "notes");
    const coverLetter = text(fd, "coverLetter");
    const cvUrl = text(fd, "cvUrl");
    const fields = parseFields(fd);
    const links = parseLinks(fd);
    const cv = pickFiles(fd, "cv");
    const other = pickFiles(fd, "other");

    if (totalSize([...cv, ...other]) > MAX_TOTAL) return err("Files are too large (max 4 MB in total).");
    if (!notes && !coverLetter && !cvUrl && !fields.length && !links.length && !cv.length && !other.length) {
      return err("Add what you prepared (cover letter, notes, form fields, or the CV) before submitting.");
    }

    const files = [...(await storeFiles(id, "cv", cv)), ...(await storeFiles(id, "attachment", other))];
    const updated = await transition(
      id,
      ["added"],
      "waiting_for_approval",
      { prepared: { notes, coverLetter, cvUrl, fields, links, files, at: new Date().toISOString() } },
      "Prepared, sent for approval",
    );
    if (!updated) return err("Could not update the job. Refresh and try again.", 409);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[prepare]", e);
    return err(`Failed: ${e instanceof Error ? e.message : "unknown error"}`, 500);
  }
}
