import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { jobsCol, oid, transition } from "@/lib/jobs";
import { MAX_TOTAL, parseLinks, pickFiles, storeFiles, text, totalSize } from "@/lib/job-files";

const err = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return err("Not logged in. Refresh and sign in again.", 401);
  try {
    const { id } = await ctx.params;
    const _id = oid(id);
    const job = _id && (await (await jobsCol()).findOne({ _id }));
    if (!job) return err("Job not found.", 404);
    if (job.status !== "approved") return err(`Only approved jobs can be reported as applied (this one is "${job.status}").`, 409);

    const fd = await req.formData();
    const method = text(fd, "method");
    const confirmation = text(fd, "confirmation");
    const cvAttached = text(fd, "cvAttached");
    const notes = text(fd, "notes");
    const proofUrl = text(fd, "proofUrl");
    const links = parseLinks(fd);
    const proof = pickFiles(fd, "proof");
    const other = pickFiles(fd, "other");

    if (totalSize([...proof, ...other]) > MAX_TOTAL) return err("Files are too large (max 4 MB in total).");
    if (!method) return err("Say how the application was submitted (e.g. Easy Apply, company website, email).");
    if (!confirmation && !proof.length && !proofUrl && !links.length) {
      return err("Add proof: the confirmation message/reference, a screenshot, or a proof link.");
    }

    const files = [...(await storeFiles(id, "proof", proof)), ...(await storeFiles(id, "attachment", other))];
    const updated = await transition(
      id,
      ["approved"],
      "applied",
      { applied: { method, confirmation, cvAttached, notes, proofUrl, links, files, at: new Date().toISOString() } },
      `Applied via ${method}`,
    );
    if (!updated) return err("Could not update the job. Refresh and try again.", 409);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[applied]", e);
    return err(`Failed: ${e instanceof Error ? e.message : "unknown error"}`, 500);
  }
}
