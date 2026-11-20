import { Badge } from "@/components/ui/badge";
import { STATUS_META, type JobStatus } from "@/lib/status";

export function StatusBadge({ status }: { status: JobStatus }) {
  const m = STATUS_META[status];
  return <Badge className={m.cls}>{m.label}</Badge>;
}
