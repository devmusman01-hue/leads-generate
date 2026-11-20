import { Suspense } from "react";
import Link from "next/link";
import { Briefcase, CheckCircle2, Clock, Inbox, LayoutDashboard, ThumbsUp } from "lucide-react";
import { AutoRefresh } from "@/components/auto-refresh";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { jobsCol, toJob } from "@/lib/jobs";
import { STATUSES, STATUS_META } from "@/lib/status";
import { timeAgo } from "@/lib/utils";

const ICONS = { added: Inbox, waiting_for_approval: Clock, approved: ThumbsUp, applied: CheckCircle2 };

async function Stats() {
  const col = await jobsCol();
  const [byStatus, byPlatform, recent] = await Promise.all([
    col.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]).toArray(),
    col.aggregate([{ $group: { _id: "$platform", n: { $sum: 1 } } }, { $sort: { n: -1 } }]).toArray(),
    col.find().sort({ createdAt: -1 }).limit(6).toArray(),
  ]);
  const count = (s: string) => byStatus.find((x) => x._id === s)?.n ?? 0;
  const total = byStatus.reduce((a, b) => a + b.n, 0);
  const max = Math.max(1, ...byPlatform.map((p) => p.n));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="flex items-center gap-4">
          <div className="float-icon flex h-11 w-11 items-center justify-center bg-white/10"><Briefcase size={20} /></div>
          <div><p className="text-2xl font-semibold">{total}</p><p className="text-xs text-muted">Total jobs</p></div>
        </Card>
        {STATUSES.map((s, i) => {
          const Icon = ICONS[s];
          return (
            <Link key={s} href={`/jobs?status=${s}`}>
              <Card className="flex items-center gap-4 transition-colors hover:bg-white/10">
                <div className="float-icon flex h-11 w-11 items-center justify-center bg-accent/20 text-accent" style={{ animationDelay: `${i * 0.5}s` }}>
                  <Icon size={20} />
                </div>
                <div><p className="text-2xl font-semibold">{count(s)}</p><p className="text-xs text-muted">{STATUS_META[s].label}</p></div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-4">Jobs by platform</CardTitle>
          {byPlatform.length === 0 && <p className="text-sm text-muted">No jobs yet. Your agent will add them here.</p>}
          <div className="space-y-3">
            {byPlatform.map((p) => (
              <Link key={p._id} href={`/jobs?platform=${encodeURIComponent(p._id)}`} className="block">
                <div className="mb-1 flex justify-between text-xs"><span className="capitalize">{p._id}</span><span className="text-muted">{p.n}</span></div>
                <div className="h-1.5 bg-white/10"><div className="h-full bg-accent" style={{ width: `${(p.n / max) * 100}%` }} /></div>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle className="mb-4">Recently added</CardTitle>
          <div className="divide-y divide-white/10">
            {recent.map(toJob).map((j) => (
              <div key={j.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm">{j.title}</p>
                  <p className="truncate text-xs text-muted">{j.company || "—"} · <span className="capitalize">{j.platform}</span> · {timeAgo(j.createdAt)}</p>
                </div>
                <StatusBadge status={j.status} />
              </div>
            ))}
            {recent.length === 0 && <p className="text-sm text-muted">Nothing yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader icon={LayoutDashboard} help="dashboard" title="Dashboard" subtitle="Overview of everything your agent has found and applied to." />
      <AutoRefresh />
      <Suspense fallback={<p className="text-sm text-muted">Loading stats…</p>}>
        <Stats />
      </Suspense>
    </>
  );
}
