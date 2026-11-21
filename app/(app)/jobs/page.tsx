import { Suspense } from "react";
import Link from "next/link";
import { ExternalLink, Mail, MapPin, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { approveJob, deleteJob, sendBack } from "@/actions/jobs";
import { AppliedForm, PrepareForm } from "@/components/job-forms";
import { AppliedView, AttachmentsView, JobCvBox, PreparedView } from "@/components/job-views";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { AutoRefresh } from "@/components/auto-refresh";
import { jobsCol, toJob } from "@/lib/jobs";
import { STATUSES, STATUS_META } from "@/lib/status";
import { cn, timeAgo } from "@/lib/utils";

type SP = { status?: string; platform?: string; q?: string };

function href(sp: SP, patch: Partial<SP>) {
  const m = { ...sp, ...patch };
  const qs = new URLSearchParams(Object.entries(m).filter(([, v]) => v) as [string, string][]).toString();
  return `/jobs${qs ? `?${qs}` : ""}`;
}

async function JobList({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const col = await jobsCol();
  const filter: Record<string, unknown> = {};
  if (sp.status && (STATUSES as readonly string[]).includes(sp.status)) filter.status = sp.status;
  if (sp.platform) filter.platform = sp.platform;
  if (sp.q) {
    const rx = { $regex: sp.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    filter.$or = [{ title: rx }, { company: rx }];
  }
  const [docs, platforms] = await Promise.all([
    col.find(filter).sort({ createdAt: -1 }).limit(200).toArray(),
    col.distinct("platform"),
  ]);
  const jobs = docs.map(toJob);

  const chip = (active: boolean) =>
    cn("rounded-full border border-white/10 px-3.5 py-1.5 text-xs transition-colors hover:bg-white/10", active && "border-accent/60 bg-accent/20 text-foreground");

  return (
    <>
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Link href={href(sp, { status: undefined })} className={chip(!sp.status)}>All stages</Link>
          {STATUSES.map((s) => (
            <Link key={s} href={href(sp, { status: s })} className={chip(sp.status === s)}>{STATUS_META[s].label}</Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">Platform:</span>
          <Link href={href(sp, { platform: undefined })} className={chip(!sp.platform)}>All</Link>
          {platforms.map((p) => (
            <Link key={p} href={href(sp, { platform: p })} className={cn(chip(sp.platform === p), "capitalize")}>{p}</Link>
          ))}
        </div>
        <form className="flex flex-col gap-2 sm:flex-row" action="/jobs">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          {sp.platform && <input type="hidden" name="platform" value={sp.platform} />}
          <input name="q" defaultValue={sp.q} placeholder="Search title or company…" className="h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 text-sm outline-none focus:border-accent/70 sm:w-72" />
          <Button variant="glass">Search</Button>
        </form>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {jobs.length === 0 && <Card className="col-span-full text-sm text-muted">No jobs match. Your agent adds jobs through the agent API.</Card>}
        {jobs.map((j) => (
          <Card key={j.id} className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{j.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted">
                  {j.company && <span>{j.company}</span>}
                  {j.location && <span className="flex items-center gap-1"><MapPin size={12} />{j.location}</span>}
                  {j.salary && <span>{j.salary}</span>}
                  <span>{timeAgo(j.createdAt)}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="border-white/15 capitalize text-muted">{j.platform}</Badge>
                <StatusBadge status={j.status} />
              </div>
            </div>

            <JobCvBox job={j} />

            {j.status === "added" && (
              <details className="rounded-xl border border-white/10 p-4 text-sm">
                <summary className="cursor-pointer text-xs font-medium">Prepare application → send for approval</summary>
                <PrepareForm jobId={j.id} />
              </details>
            )}

            {j.status === "waiting_for_approval" && j.prepared && <PreparedView prepared={j.prepared} hasCv={!!j.cv} />}

            {j.status === "approved" && (
              <>
                {j.prepared && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-xs text-muted hover:text-foreground">Approved application (what was prepared)</summary>
                    <div className="mt-3"><PreparedView prepared={j.prepared} hasCv={!!j.cv} /></div>
                  </details>
                )}
                <details open className="rounded-xl border border-emerald-400/20 p-4 text-sm">
                  <summary className="cursor-pointer text-xs font-medium text-emerald-300">After applying: report how it went</summary>
                  <AppliedForm jobId={j.id} />
                </details>
              </>
            )}

            {j.status === "applied" && (
              <>
                {j.applied ? <AppliedView applied={j.applied} /> : <p className="text-xs text-muted">Marked applied without a report.</p>}
                {j.prepared && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-xs text-muted hover:text-foreground">What was prepared before applying</summary>
                    <div className="mt-3"><PreparedView prepared={j.prepared} hasCv={!!j.cv} /></div>
                  </details>
                )}
              </>
            )}

            <AttachmentsView job={j} />

            <details className="text-sm">
              <summary className="cursor-pointer text-xs text-muted hover:text-foreground">Details & history</summary>
              <div className="mt-3 space-y-3">
                {j.description && <p className="max-h-48 overflow-auto whitespace-pre-wrap text-muted">{j.description}</p>}
                {Object.keys(j.extra).length > 0 && (
                  <dl className="grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-[auto_1fr]">
                    {Object.entries(j.extra).map(([k, val]) => (
                      <div key={k} className="contents">
                        <dt className="text-muted">{k}</dt>
                        <dd className="break-words">{String(val)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <ol className="space-y-1 text-xs text-muted">
                  {j.history.map((h, i) => (
                    <li key={i}>{STATUS_META[h.status].label} · {timeAgo(h.at)}{h.note ? ` · ${h.note}` : ""}</li>
                  ))}
                </ol>
              </div>
            </details>

            <div className="flex flex-wrap items-center gap-2">
              {j.url && (
                <a href={j.url} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" type="button"><ExternalLink size={14} /> Open posting</Button>
                </a>
              )}
              {j.status === "waiting_for_approval" && (
                <>
                  <form action={approveJob}>
                    <input type="hidden" name="id" value={j.id} />
                    <SubmitButton variant="success" size="sm" pendingText="Approving…">Approve</SubmitButton>
                  </form>
                  <form action={sendBack} className="flex gap-2">
                    <input type="hidden" name="id" value={j.id} />
                    <Input name="reason" placeholder="Why send back? (optional)" className="h-9 w-44" />
                    <SubmitButton variant="outline" size="sm" pendingText="Sending…">Send back</SubmitButton>
                  </form>
                </>
              )}
              <form action={deleteJob} className="ml-auto">
                <input type="hidden" name="id" value={j.id} />
                <SubmitButton variant="destructive" size="sm"><Trash2 size={14} /> Delete</SubmitButton>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export default function JobsPage({ searchParams }: { searchParams: Promise<SP> }) {
  return (
    <>
      <PageHeader
        icon={Mail}
        help="jobs"
        title="Received with email"
        subtitle="Jobs your agent adds and tracks. Approve once an application is prepared."
        actions={<Link href="/add-job"><Button size="sm"><Plus size={14} /> Add job</Button></Link>}
      />
      <AutoRefresh />
      <Suspense fallback={<p className="text-sm text-muted">Loading jobs…</p>}>
        <JobList searchParams={searchParams} />
      </Suspense>
    </>
  );
}
