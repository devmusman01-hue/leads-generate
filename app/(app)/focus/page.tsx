import { Suspense } from "react";
import { Crosshair } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { FocusCard } from "./focus-card";

export default function FocusPage() {
  return (
    <>
      <PageHeader
        icon={Crosshair}
        help="focus"
        title="Focus keywords"
        subtitle="The areas and scope of jobs your agent is allowed to add."
      />
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <FocusCard />
      </Suspense>
    </>
  );
}
