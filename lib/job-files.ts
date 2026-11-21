import { Binary, ObjectId } from "mongodb";
import { getDb } from "./db";
import type { JobFile } from "./types";

// Vercel rejects request bodies over ~4.5 MB, so keep the total per request under 4 MB.
export const MAX_TOTAL = 4 * 1024 * 1024;

export async function filesCol() {
  return (await getDb()).collection("job_files");
}

export const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export function parseFields(fd: FormData) {
  const keys = fd.getAll("cfKey").map(String);
  const vals = fd.getAll("cfValue").map(String);
  const out: { label: string; value: string }[] = [];
  keys.forEach((k, i) => {
    const label = k.trim();
    const value = (vals[i] ?? "").trim();
    if (label && value) out.push({ label, value });
  });
  return out;
}

export function parseLinks(fd: FormData) {
  const labels = fd.getAll("lnLabel").map(String);
  const urls = fd.getAll("lnUrl").map(String);
  const out: { label: string; url: string }[] = [];
  urls.forEach((u, i) => {
    let url = u.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    out.push({ label: (labels[i] ?? "").trim() || url, url });
  });
  return out;
}

export function totalSize(files: File[]) {
  return files.reduce((a, f) => a + f.size, 0);
}

export function pickFiles(fd: FormData, name: string) {
  return fd.getAll(name).filter((f): f is File => typeof f !== "string" && f.size > 0);
}

export async function storeFiles(jobId: string, kind: JobFile["kind"], files: File[]): Promise<JobFile[]> {
  const col = await filesCol();
  const out: JobFile[] = [];
  for (const f of files) {
    const buf = Buffer.from(await f.arrayBuffer());
    const res = await col.insertOne({
      jobId,
      kind,
      name: f.name,
      contentType: f.type || "application/octet-stream",
      size: f.size,
      data: new Binary(buf),
      createdAt: new Date(),
    });
    out.push({ id: String(res.insertedId), name: f.name, kind, contentType: f.type, size: f.size });
  }
  return out;
}

export function fileId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}
