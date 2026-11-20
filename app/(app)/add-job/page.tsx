import { Suspense } from "react";
import { FilePlus2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { jobsCol } from "@/lib/jobs";
import { AddJobForm } from "./add-job-form";

async function FormWithPlatforms() {
  const platforms = (await (await jobsCol()).distinct("platform")) as string[];
  return <AddJobForm platforms={platforms} />;
}

export default function AddJobPage() {
  return (
    <>
      <PageHeader icon={FilePlus2} help="addJob" title="Add job" subtitle="Add a job with whatever fields it has. Nothing is required." />
      <div>
        <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
          <FormWithPlatforms />
        </Suspense>
      </div>
    </>
  );
}
