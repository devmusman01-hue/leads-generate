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

export async function deleteJob(formData: FormData) {
  await requireAuth();
  const _id = oid(String(formData.get("id")));
  if (_id) await (await jobsCol()).deleteOne({ _id });
  revalidatePath("/", "layout");
}

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function sendBack(formData: FormData) {
  await requireAuth();
  const reason = str(formData, "reason");
  await transition(str(formData, "id"), ["waiting_for_approval"], "added", {}, `Sent back by owner${reason ? `: ${reason}` : ""}`);
  revalidatePath("/", "layout");
}
