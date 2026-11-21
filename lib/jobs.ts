import { ObjectId, type Document } from "mongodb";
import { getDb } from "./db";
import type { Job } from "./types";
import type { JobStatus } from "./status";

export async function jobsCol() {
  return (await getDb()).collection("jobs");
}

export function toJob(d: Document): Job {
  const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : new Date(String(v ?? Date.now())).toISOString());
  return {
    id: String(d._id),
    title: d.title ?? "Untitled job",
    company: d.company ?? "",
    platform: d.platform ?? "unknown",
    url: d.url ?? "",
    location: d.location ?? "",
    salary: d.salary ?? "",
    description: d.description ?? "",
    status: d.status as JobStatus,
    prepared: d.prepared ?? null,
    applied: d.applied ?? null,
    attachments: d.attachments ?? null,
    cv: d.cv ?? null,
    cvHistory: d.cvHistory ?? [],
    extra: d.extra ?? {},
    history: (d.history ?? []).map((h: Document) => ({ status: h.status, at: iso(h.at), note: h.note })),
    createdAt: iso(d.createdAt),
    updatedAt: iso(d.updatedAt),
  };
}

export function oid(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export async function transition(id: string, from: JobStatus[], to: JobStatus, set: Document = {}, note?: string) {
  const _id = oid(id);
  if (!_id) return null;
  const now = new Date();
  const col = await jobsCol();
  const res = await col.findOneAndUpdate(
    { _id, status: { $in: from } },
    { $set: { ...set, status: to, updatedAt: now }, $push: { history: { status: to, at: now, note } } } as Document,
    { returnDocument: "after" },
  );
  return res ? toJob(res) : null;
}
