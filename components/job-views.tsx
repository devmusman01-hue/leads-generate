import { AlertTriangle, Download, ExternalLink, FileText, Link2 } from "lucide-react";
import { CvForm } from "@/components/job-forms";
import type { Job, JobFile, JobLink } from "@/lib/types";

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "");

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs text-muted">{label}</p>
      <p className="whitespace-pre-wrap break-words">{children}</p>
    </div>
  );
}

export function PreparedView({ prepared, hasCv = false }: { prepared: NonNullable<Job["prepared"]>; hasCv?: boolean }) {
  const empty =
    !hasCv && !prepared.notes && !prepared.coverLetter && !prepared.cvUrl && !prepared.fields?.length && !prepared.files?.length && !prepared.links?.length;
  if (empty) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <p>The agent submitted this without recording anything. Send it back so it can fill in what it prepared.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm">
      <p className="text-xs font-medium text-amber-300">Prepared application {prepared.at && <span className="text-muted">· {fmt(prepared.at)}</span>}</p>
      {prepared.notes && <Block label="Notes">{prepared.notes}</Block>}
      {prepared.coverLetter && <Block label="Cover letter / answers">{prepared.coverLetter}</Block>}
      {!!prepared.fields?.length && (
        <div>
          <p className="mb-1.5 text-xs text-muted">Form fields to be filled</p>
          <dl className="grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-[auto_1fr]">
            {prepared.fields.map((f, i) => (
              <div key={i} className="contents"><dt className="text-muted">{f.label}</dt><dd className="break-words">{f.value}</dd></div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}

export function AppliedView({ applied }: { applied: NonNullable<Job["applied"]> }) {
  return (
    <div className="space-y-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm">
      <p className="text-xs font-medium text-emerald-300">Application report <span className="text-muted">· {fmt(applied.at)}</span></p>
      <Block label="Submitted via">{applied.method}</Block>
      {applied.confirmation && <Block label="Confirmation">{applied.confirmation}</Block>}
      {applied.cvAttached && <Block label="CV attached">{applied.cvAttached}</Block>}
      {applied.notes && <Block label="Notes">{applied.notes}</Block>}
    </div>
  );
}

// ---------- Everything attached to a job, across all stages ----------
type Stage = "Added" | "Prepared" | "Applied";
type Item = { stage: Stage; type: "file" | "link"; label: string; href: string; file?: JobFile };

function collect(j: Job): Item[] {
  const items: Item[] = [];
  const link = (stage: Stage, l: JobLink) => items.push({ stage, type: "link", label: l.label, href: l.url });
  const file = (stage: Stage, f: JobFile) =>
    items.push({ stage, type: "file", label: f.kind === "cv" ? `CV: ${f.name}` : f.kind === "proof" ? `Proof: ${f.name}` : f.name, href: `/api/job-files/${f.id}`, file: f });

  if (j.url) link("Added", { label: "Job posting", url: j.url });
  j.attachments?.links.forEach((l) => link("Added", l));
  j.attachments?.files.forEach((f) => file("Added", f));

  if (j.prepared?.cvUrl) link("Prepared", { label: "Customised CV (link)", url: j.prepared.cvUrl });
  j.prepared?.links?.forEach((l) => link("Prepared", l));
  j.prepared?.files?.forEach((f) => file("Prepared", f));

  if (j.applied?.proofUrl) link("Applied", { label: "Proof (link)", url: j.applied.proofUrl });
  j.applied?.links?.forEach((l) => link("Applied", l));
  j.applied?.files.forEach((f) => file("Applied", f));
  return items;
}

const STAGE_TONE: Record<Stage, string> = {
  Added: "text-sky-300",
  Prepared: "text-amber-300",
  Applied: "text-emerald-300",
};

export function AttachmentsView({ job }: { job: Job }) {
  const items = collect(job);
  if (!items.length) return null;
  const open = job.status === "waiting_for_approval" || job.status === "applied";
  const stages: Stage[] = ["Added", "Prepared", "Applied"];

  return (
    <details open={open} className="rounded-xl border border-white/10 p-4 text-sm">
      <summary className="cursor-pointer text-xs font-medium">Files & links ({items.length})</summary>
      <div className="mt-4 space-y-4">
        {stages.map((st) => {
          const list = items.filter((i) => i.stage === st);
          if (!list.length) return null;
          return (
            <div key={st}>
              <p className={`mb-2 text-[11px] font-semibold uppercase tracking-wider ${STAGE_TONE[st]}`}>{st === "Added" ? "When added" : st === "Prepared" ? "Prepared by agent" : "When applied"}</p>
              <ul className="space-y-2">
                {list.map((it, i) => (
                  <li key={i}>
                    {it.type === "file" && it.file?.contentType.startsWith("image/") ? (
                      <a href={it.href} target="_blank" className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={it.href} alt={it.label} className="max-h-36 w-full rounded-lg border border-white/10 object-cover object-top" />
                        <span className="mt-1 block text-xs text-muted">{it.label}</span>
                      </a>
                    ) : (
                      <a href={it.href} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-xs text-accent hover:underline">
                        {it.type === "file" ? <FileText size={14} className="mt-0.5 shrink-0" /> : <Link2 size={14} className="mt-0.5 shrink-0" />}
                        <span className="min-w-0 break-all">
                          {it.label}
                          {it.type === "file" && it.file && <span className="text-muted"> ({Math.max(1, Math.round(it.file.size / 1024))} KB)</span>}
                          {it.type === "link" && it.label !== it.href && <span className="block text-muted">{it.href}</span>}
                        </span>
                        {it.type === "link" && <ExternalLink size={12} className="mt-0.5 shrink-0" />}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </details>
  );
}

// ---------- The customised CV saved with this job (always visible, any stage) ----------
export function JobCvBox({ job }: { job: Job }) {
  const cv = job.cv;
  return (
    <div className="space-y-3 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-accent">Customised CV for this job</p>
        {cv && (cv.file || cv.text || cv.link) && (
          <a href={`/api/jobs/${job.id}/cv`} className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 px-3 py-1 text-xs text-accent hover:bg-accent/10">
            <Download size={13} /> Download CV
          </a>
        )}
      </div>

      {cv ? (
        <div className="space-y-2 text-xs">
          {cv.file && (
            <p className="flex items-center gap-1.5"><FileText size={13} className="shrink-0 text-accent" /><a href={`/api/job-files/${cv.file.id}`} target="_blank" className="break-all text-accent hover:underline">{cv.file.name}</a><span className="text-muted">({Math.max(1, Math.round(cv.file.size / 1024))} KB)</span></p>
          )}
          {cv.link && (
            <p className="flex items-center gap-1.5"><Link2 size={13} className="shrink-0 text-accent" /><a href={cv.link} target="_blank" rel="noreferrer" className="break-all text-accent hover:underline">{cv.link}</a></p>
          )}
          {cv.text && (
            <details>
              <summary className="cursor-pointer text-muted hover:text-foreground">View saved CV text</summary>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-black/30 p-3 text-xs">{cv.text}</pre>
            </details>
          )}
          {cv.note && <p className="text-muted">Customised: {cv.note}</p>}
          <p className="text-muted">Saved {fmt(cv.at)}</p>
        </div>
      ) : (
        <p className="text-xs text-muted">No CV saved for this job yet. Save it here so it can be found again when applying and for interview prep.</p>
      )}

      <details>
        <summary className="cursor-pointer text-xs font-medium">{cv ? "Replace / update the CV" : "Save the CV"}</summary>
        <CvForm jobId={job.id} hasCv={!!cv} />
      </details>

      {job.cvHistory.length > 0 && (
        <details>
          <summary className="cursor-pointer text-xs text-muted hover:text-foreground">Previous versions ({job.cvHistory.length})</summary>
          <ul className="mt-2 space-y-1.5 text-xs">
            {[...job.cvHistory].reverse().map((h, i) => (
              <li key={i} className="text-muted">
                {fmt(h.at)} ·{" "}
                {h.file ? <a href={`/api/job-files/${h.file.id}`} target="_blank" className="text-accent hover:underline">{h.file.name}</a> : h.link ? <a href={h.link} target="_blank" className="text-accent hover:underline">link</a> : "text only"}
                {h.note ? ` · ${h.note}` : ""}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
