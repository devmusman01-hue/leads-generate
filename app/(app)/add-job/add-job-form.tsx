"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { addJob, type AddJobResult } from "@/actions/jobs";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";

const SUGGESTIONS = ["Job type", "Experience", "Deadline", "Contact email", "Remote / On-site", "Tech stack", "Notes"];
type Row = { id: number; label: string };

export function AddJobForm({ platforms }: { platforms: string[] }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [nextId, setNextId] = useState(1);
  const [result, setResult] = useState<AddJobResult>();

  function addRow(label = "") {
    setRows((r) => [...r, { id: nextId, label }]);
    setNextId((n) => n + 1);
  }

  async function action(formData: FormData) {
    const r = await addJob(undefined, formData);
    setResult(r);
    if (r?.ok) setRows([]); // React resets the inputs itself after the action completes
  }

  return (
    <form action={action} className="grid items-start gap-5 xl:grid-cols-2">
      <Card className="space-y-4">
        <div>
          <p className="text-sm font-semibold">Job details</p>
          <p className="mt-1 text-xs text-muted">Every field is optional. Fill in only what this job has.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="title" placeholder="Job title" />
          <Input name="company" placeholder="Company" />
          <Input name="platform" list="platform-list" placeholder="Platform (linkedin, indeed…)" />
          <datalist id="platform-list">{platforms.map((p) => <option key={p} value={p} />)}</datalist>
          <Input name="url" placeholder="Job URL" />
          <Input name="location" placeholder="Location" />
          <Input name="salary" placeholder="Salary" />
          <Textarea name="description" placeholder="Description" className="min-h-28 sm:col-span-2" />
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-sm font-semibold">Custom fields</p>
          <p className="mt-1 text-xs text-muted">Add any extra detail with your own label — different for every job.</p>
        </div>
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-col gap-2 sm:flex-row">
              <Input name="cfKey" defaultValue={r.label} placeholder="Field name" className="sm:w-56 sm:shrink-0" />
              <Input name="cfValue" placeholder="Value" />
              <Button type="button" variant="ghost" size="icon" onClick={() => setRows((x) => x.filter((y) => y.id !== r.id))} aria-label="Remove field">
                <X size={14} />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="glass" size="sm" onClick={() => addRow()}><Plus size={14} /> Add field</Button>
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => addRow(s)} className="cursor-pointer rounded-full border border-white/10 px-3 py-1 text-xs text-muted transition-colors hover:bg-white/10 hover:text-foreground">
              + {s}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-4 xl:col-span-2">
        <SubmitButton pendingText="Adding…">Add job</SubmitButton>
        {result?.ok && <p className="flex items-center gap-1.5 text-sm text-emerald-400"><Check size={14} /> {result.ok}</p>}
        {result?.error && <p className="text-sm text-red-400">{result.error}</p>}
      </div>
    </form>
  );
}
