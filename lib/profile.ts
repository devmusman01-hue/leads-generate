import { type Document } from "mongodb";
import { getDb } from "./db";
import type { ProfileSection } from "./types";

export async function sectionsCol() {
  return (await getDb()).collection("profile_sections");
}

export function toSection(d: Document): ProfileSection {
  return {
    id: String(d._id),
    name: d.name,
    type: d.type,
    fields: d.fields ?? [],
    items: d.items ?? [],
    order: d.order ?? 0,
  };
}

export async function getSections() {
  const docs = await (await sectionsCol()).find().sort({ order: 1 }).toArray();
  return docs.map(toSection);
}
