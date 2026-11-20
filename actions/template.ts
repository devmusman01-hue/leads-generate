"use server";

import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/auth";
import { templateCol } from "@/lib/template";

export async function saveInstructions(_prev: { ok?: boolean } | undefined, formData: FormData) {
  if (!(await isAuthed())) throw new Error("Unauthorized");
  await (await templateCol()).updateOne(
    { _id: "current" as never },
    { $set: { instructions: String(formData.get("instructions") ?? "").trim() } },
    { upsert: true },
  );
  revalidatePath("/template");
  return { ok: true };
}
