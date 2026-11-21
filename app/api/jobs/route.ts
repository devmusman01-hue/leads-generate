import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { jobsCol } from "@/lib/jobs";
import { MAX_TOTAL, parseFields, parseLinks, pickFiles, storeFiles, text, totalSize } from "@/lib/job-files";

const err = (error: string, status = 400) => NextResponse.json({ error }, { status });
const CORE = ["title", "company", "platform", "url", "location", "salary", "description"] as const;

export async function POST(req: Request) {
  if (!(await isAuthed())) return err("Not logged in. Refresh and sign in again.", 401);
  try {
    const fd = await req.formData();
    const v = Object.fromEntries(CORE.map((k) => [k, text(fd, k)])) as Record<(typeof CORE)[number], string>;
    const extra = Object.fromEntries(parseFields(fd).map((f) => [f.label, f.value]));
    const links = parseLinks(fd);
    const files = pickFiles(fd, "files");

    if (totalSize(files) > MAX_TOTAL) return err("Files are too large (max 4 MB in total).");
    if (!CORE.some((k) => v[k]) && !Object.keys(extra).length && !links.length && !files.length) return err("Fill in at least one field.");

    const col = await jobsCol();
    if (v.url && (await col.findOne({ url: v.url }))) return err("A job with this URL already exists.", 409);

    const now = new Date();
    const res = await col.insertOne({
      title: v.title || v.company || v.url || "Untitled job",
      company: v.company,
      platform: v.platform.toLowerCase() || "unknown",
      url: v.url,
      location: v.location,
      salary: v.salary,
      description: v.description,
      status: "added",
      prepared: null,
      applied: null,
      attachments: { files: [], links },
      extra,
      history: [{ status: "added", at: now }],
      createdAt: now,
      updatedAt: now,
    });
    if (files.length) {
      const stored = await storeFiles(String(res.insertedId), "attachment", files);
      await col.updateOne({ _id: res.insertedId }, { $set: { "attachments.files": stored } });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[add job]", e);
    return err(`Failed: ${e instanceof Error ? e.message : "unknown error"}`, 500);
  }
}
