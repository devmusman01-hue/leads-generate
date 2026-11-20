import { NextResponse } from "next/server";
import { z } from "zod";
import { guard } from "@/lib/agent";
import { jobsCol, oid, toJob, transition } from "@/lib/jobs";

const Patch = z.object({
  // Agent may only move: added -> waiting_for_approval, approved -> applied
  status: z.enum(["waiting_for_approval", "applied"]),
  note: z.string().optional(),
  prepared: z
    .object({ coverLetter: z.string().optional(), notes: z.string().optional(), cvUrl: z.string().optional() })
    .optional(),
});

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = guard(req);
  if (denied) return denied;
  const _id = oid((await ctx.params).id);
  const doc = _id && (await (await jobsCol()).findOne({ _id }));
  return doc ? NextResponse.json({ job: toJob(doc) }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = guard(req);
  if (denied) return denied;
  const parsed = Patch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body", details: parsed.error.issues }, { status: 400 });
  const { status, note, prepared } = parsed.data;
  const from = status === "waiting_for_approval" ? (["added"] as const) : (["approved"] as const);
  const set = prepared ? { prepared } : {};
  const job = await transition((await ctx.params).id, [...from], status, set, note);
  if (!job) {
    return NextResponse.json(
      { error: `Job not found or not in the required state (${from[0]} -> ${status})` },
      { status: 409 },
    );
  }
  return NextResponse.json({ job });
}
