import { Suspense } from "react";
import { Download, FileUser } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTemplate } from "@/lib/template";
import { InstructionsForm, TemplateUpload } from "./template-forms";

async function Current() {
  const t = await getTemplate();
  if (!t?.data) return <p className="text-sm text-muted">No template uploaded yet.</p>;
  const placeholders: string[] = t.placeholders ?? [];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="float-icon flex h-11 w-11 items-center justify-center bg-accent/20 text-accent"><FileUser size={20} /></div>
          <div>
            <p className="text-sm font-medium break-all">{t.filename}</p>
            <p className="text-xs text-muted">{(t.size / 1024).toFixed(0)} KB · uploaded {new Date(t.uploadedAt).toLocaleString()}</p>
          </div>
        </div>
        <a href="/api/template"><Button variant="outline" size="sm" type="button"><Download size={14} /> Download</Button></a>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted">Placeholders found</p>
        {placeholders.length ? (
          <div className="flex flex-wrap gap-2">{placeholders.map((p) => <Badge key={p} className="border-accent/40 bg-accent/10 text-accent">{p}</Badge>)}</div>
        ) : (
          <p className="text-xs text-muted">None. Tip: use markers like {"{{full_name}}"} in your DOCX so the agent knows exactly what to fill.</p>
        )}
      </div>

      <details className="rounded-xl border border-white/10 p-4 text-sm">
        <summary className="cursor-pointer text-xs font-medium">What the agent reads (extracted text)</summary>
        {t.text ? (
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs text-muted">{t.text}</pre>
        ) : (
          <p className="mt-3 text-xs text-muted">Text extraction works for DOCX, TXT, MD and TEX files. For PDFs the agent sees the file only, so DOCX is recommended.</p>
        )}
      </details>
    </div>
  );
}

async function Instructions() {
  const t = await getTemplate();
  return <InstructionsForm initial={t?.instructions ?? ""} />;
}

export default function TemplatePage() {
  return (
    <>
      <PageHeader icon={FileUser} help="template" title="Upload a template" subtitle="Your CV template and the rules your agent follows when customising it for each job." />
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <p className="mb-5 text-sm font-semibold">Current template</p>
          <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}><Current /></Suspense>
        </Card>
        <div className="space-y-5">
          <Card>
            <p className="mb-5 text-sm font-semibold">Upload new</p>
            <TemplateUpload />
          </Card>
          <Card>
            <p className="mb-1 text-sm font-semibold">Agent instructions</p>
            <p className="mb-4 text-xs text-muted">Plain-language rules for how the agent should edit your CV.</p>
            <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}><Instructions /></Suspense>
          </Card>
        </div>
      </div>
    </>
  );
}
