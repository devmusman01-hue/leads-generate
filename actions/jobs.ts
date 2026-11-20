"use server";

import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/auth";
import { jobsCol, oid, transition } from "@/lib/jobs";

async function requireAuth() {
  if (!(await isAuthed())) throw new Error("Unauthorized");
}

export async function approveJob(formData: FormData) {
  await requireAuth();
  await transition(String(formData.get("id")), ["waiting_for_approval"], "approved", {}, "Approved by user");
  revalidatePath("/", "layout");
}

export async function markAppliedManually(formData: FormData) {
  await requireAuth();
  await transition(String(formData.get("id")), ["approved"], "applied", {}, "Marked applied by user");
  revalidatePath("/", "layout");
}

export async function deleteJob(formData: FormData) {
  await requireAuth();
  const _id = oid(String(formData.get("id")));
  if (_id) await (await jobsCol()).deleteOne({ _id });
  revalidatePath("/", "layout");
}

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export type AddJobResult = { ok?: string; error?: string } | undefined;

export async function addJob(_prev: AddJobResult, formData: FormData): Promise<AddJobResult> {
  await requireAuth();
  const core = ["title", "company", "platform", "url", "location", "salary", "description"] as const;
  const v = Object.fromEntries(core.map((k) => [k, str(formData, k)])) as Record<(typeof core)[number], string>;

  // Any number of custom fields, completely free-form.
  const keys = formData.getAll("cfKey").map(String);
  const vals = formData.getAll("cfValue").map(String);
  const extra: Record<string, string> = {};
  keys.forEach((k, i) => {
    const key = k.trim();
    const val = (vals[i] ?? "").trim();
    if (key && val) extra[key] = val;
  });

  if (!core.some((k) => v[k]) && Object.keys(extra).length === 0) return { error: "Fill in at least one field." };

  const col = await jobsCol();
  if (v.url && (await col.findOne({ url: v.url }))) return { error: "A job with this URL already exists." };
  const now = new Date();
  await col.insertOne({
    title: v.title || v.company || v.url || "Untitled job",
    company: v.company,
    platform: v.platform.toLowerCase() || "unknown",
    url: v.url,
    location: v.location,
    salary: v.salary,
    description: v.description,
    status: "added",
    prepared: null,
    extra,
    history: [{ status: "added", at: now }],
    createdAt: now,
    updatedAt: now,
  });
  revalidatePath("/", "layout");
  return { ok: "Job added." };
}

export async function submitForApproval(formData: FormData) {
  await requireAuth();
  await transition(
    str(formData, "id"),
    ["added"],
    "waiting_for_approval",
    { prepared: { notes: str(formData, "notes"), coverLetter: str(formData, "coverLetter"), cvUrl: str(formData, "cvUrl") } },
    "Prepared, sent for approval",
  );
  revalidatePath("/", "layout");
}
