export const STATUSES = ["added", "waiting_for_approval", "approved", "applied"] as const;
export type JobStatus = (typeof STATUSES)[number];

export const STATUS_META: Record<JobStatus, { label: string; cls: string }> = {
  added: { label: "Added", cls: "border-sky-400/30 bg-sky-400/10 text-sky-300" },
  waiting_for_approval: { label: "Waiting for approval", cls: "border-amber-400/30 bg-amber-400/10 text-amber-300" },
  approved: { label: "Approved", cls: "border-violet-400/30 bg-violet-400/10 text-violet-300" },
  applied: { label: "Applied", cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" },
};
