import type { JobStatus } from "./status";

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
  prepared: { coverLetter?: string; notes?: string; cvUrl?: string } | null;
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
