"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/auth";
import { oid } from "@/lib/jobs";
import { sectionsCol } from "@/lib/profile";
import { focusCol } from "@/lib/focus";

async function ctx(formData: FormData) {
  if (!(await isAuthed())) throw new Error("Unauthorized");
  const _id = oid(String(formData.get("sectionId")));
  if (!_id) throw new Error("Bad section");
  return { _id, col: await sectionsCol() };
}
const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const done = () => revalidatePath("/profile");

export async function createSection(formData: FormData) {
  if (!(await isAuthed())) throw new Error("Unauthorized");
  const name = s(formData, "name");
  if (!name) return;
  const type = s(formData, "type") === "items" ? "items" : "fields";
  const col = await sectionsCol();
  await col.insertOne({ name, type, fields: [], items: [], order: Date.now() });
  done();
}

export async function renameSection(formData: FormData) {
  const { _id, col } = await ctx(formData);
  const name = s(formData, "name");
  if (name) await col.updateOne({ _id }, { $set: { name } });
  done();
}

export async function deleteSection(formData: FormData) {
  const { _id, col } = await ctx(formData);
  await col.deleteOne({ _id });
  done();
}

export async function addField(formData: FormData) {
  const { _id, col } = await ctx(formData);
  const label = s(formData, "label");
  if (!label) return;
  await col.updateOne({ _id }, { $push: { fields: { id: randomUUID(), label, value: s(formData, "value") } } } as never);
  done();
}

export async function saveField(formData: FormData) {
  const { _id, col } = await ctx(formData);
  await col.updateOne(
    { _id, "fields.id": s(formData, "id") },
    { $set: { "fields.$.label": s(formData, "label"), "fields.$.value": s(formData, "value") } },
  );
  done();
}

export async function deleteField(formData: FormData) {
  const { _id, col } = await ctx(formData);
  await col.updateOne({ _id }, { $pull: { fields: { id: s(formData, "id") } } } as never);
  done();
}

export async function addItem(formData: FormData) {
  const { _id, col } = await ctx(formData);
  const title = s(formData, "title");
  if (!title) return;
  const item = {
    id: randomUUID(),
    title,
    subtitle: s(formData, "subtitle"),
    link: s(formData, "link"),
    description: s(formData, "description"),
  };
  await col.updateOne({ _id }, { $push: { items: item } } as never);
  done();
}

export async function saveItem(formData: FormData) {
  const { _id, col } = await ctx(formData);
  await col.updateOne(
    { _id, "items.id": s(formData, "id") },
    {
      $set: {
        "items.$.title": s(formData, "title"),
        "items.$.subtitle": s(formData, "subtitle"),
        "items.$.link": s(formData, "link"),
        "items.$.description": s(formData, "description"),
      },
    },
  );
  done();
}

export async function deleteItem(formData: FormData) {
  const { _id, col } = await ctx(formData);
  await col.updateOne({ _id }, { $pull: { items: { id: s(formData, "id") } } } as never);
  done();
}

// ---------- Focus keywords (tells the agent which jobs to add) ----------

async function authed() {
  if (!(await isAuthed())) throw new Error("Unauthorized");
}
const kindOf = (f: FormData) => (String(f.get("kind")) === "exclude" ? "exclude" : "include");

export async function addKeywords(formData: FormData) {
  await authed();
  const list = String(formData.get("text") ?? "")
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
  if (!list.length) return;
  await (await focusCol()).updateOne({ _id: "focus" as never }, { $addToSet: { [kindOf(formData)]: { $each: list } } } as never, { upsert: true });
  revalidatePath("/profile");
}

export async function removeKeyword(formData: FormData) {
  await authed();
  await (await focusCol()).updateOne({ _id: "focus" as never }, { $pull: { [kindOf(formData)]: String(formData.get("value")) } } as never);
  revalidatePath("/profile");
}

export async function saveFocusNotes(formData: FormData) {
  await authed();
  await (await focusCol()).updateOne({ _id: "focus" as never }, { $set: { notes: String(formData.get("notes") ?? "").trim() } }, { upsert: true });
  revalidatePath("/profile");
}
