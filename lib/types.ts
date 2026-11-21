import type { JobStatus } from "./status";

export type JobFile = { id: string; name: string; kind: "cv" | "proof" | "attachment"; contentType: string; size: number };

export type JobLink = { label: string; url: string };

export type Job = {
  id: string;
  title: string;
  company: string;
  platform: string;
  url: string;
  location: string;
  salary: string;
  description: string;
  status: JobStatus;
  prepared: {
    coverLetter?: string;
    notes?: string;
    cvUrl?: string;
    fields?: { label: string; value: string }[];
    files?: JobFile[];
    links?: JobLink[];
    at?: string;
  } | null;
  applied: {
    method: string;
    confirmation: string;
    cvAttached: string;
    notes: string;
    proofUrl: string;
    files: JobFile[];
    links?: JobLink[];
    at: string;
  } | null;
  attachments: { files: JobFile[]; links: JobLink[] } | null;
  extra: Record<string, unknown>;
  history: { status: JobStatus; at: string; note?: string }[];
  createdAt: string;
  updatedAt: string;
};

export type ProfileField = { id: string; label: string; value: string };
export type ProfileItem = { id: string; title: string; subtitle: string; link: string; description: string };
export type ProfileSection = {
  id: string;
  name: string;
  type: "fields" | "items";
  fields: ProfileField[];
  items: ProfileItem[];
  order: number;
};
