import { NextResponse } from "next/server";
import { z } from "zod";
import { guard } from "@/lib/agent";
import { jobsCol, toJob } from "@/lib/jobs";
import { STATUSES } from "@/lib/status";

// Flexible schema: only `platform` + one of (title|url) are expected; anything else lands in `extra`.
const NewJob = z
  .object({
    title: z.string().optional(),
    company: z.string().optional(),
    platform: z.string().min(1).default("unknown"),
    url: z.string().optional(),
    location: z.string().optional(),
    salary: z.string().optional(),
    description: z.string().optional(),
  })
  .passthrough();

export async function GET(req: Request) {
  const denied = guard(req);
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  const filter: Record<string, unknown> = {};
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  if (status && (STATUSES as readonly string[]).includes(status)) filter.status = status;
  if (platform) filter.platform = platform;
  const docs = await (await jobsCol()).find(filter).sort({ createdAt: -1 }).limit(200).toArray();
  return NextResponse.json({ jobs: docs.map(toJob) });
}

export async function POST(req: Request) {
  const denied = guard(req);
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  const parsed = NewJob.safeParse(body);
  if (!parsed.success || (!parsed.data.title && !parsed.data.url)) {
    return NextResponse.json({ error: "Provide at least `title` or `url`", details: parsed.error?.issues }, { status: 400 });
  }
  const { title, company, platform, url, location, salary, description, ...extra } = parsed.data;
  const col = await jobsCol();
  if (url) {
    const dup = await col.findOne({ url });
    if (dup) return NextResponse.json({ job: toJob(dup), duplicate: true }, { status: 200 });
  }
  const now = new Date();
  const doc = {
    title: title ?? "Untitled job",
    company: company ?? "",
    platform: platform.trim().toLowerCase(),
    url: url ?? "",
    location: location ?? "",
    salary: salary ?? "",
    description: description ?? "",
    status: "added",
    prepared: null,
    extra,
    history: [{ status: "added", at: now }],
    createdAt: now,
    updatedAt: now,
  };
  const res = await col.insertOne(doc);
  return NextResponse.json({ job: toJob({ ...doc, _id: res.insertedId }) }, { status: 201 });
}
