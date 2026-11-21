"use client";

import { useState } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FILE_CLS, Label, LinkRows, useSubmit } from "@/components/job-forms";

const SUGGESTIONS = ["Job type", "Experience", "Deadline", "Contact email", "Remote / On-site", "Tech stack", "Notes"];
type Row = { id: number; label: string };

export function AddJobForm({ platforms }: { platforms: string[] }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [nextId, setNextId] = useState(1);
  const [links, setLinks] = useState<number[]>([]);
  const [ok, setOk] = useState("");

  const { busy, error, submit } = useSubmit("/api/jobs", ["files"], (form) => {
    form.reset();
    setRows([]);
    setLinks([]);
    setOk("Job added.");
  });

  function addRow(label = "") {
    setRows((r) => [...r, { id: nextId, label }]);
    setNextId((n) => n + 1);
  }

  return (
    <form onSubmit={(e) => { setOk(""); return submit(e); }} className="grid items-start gap-5 xl:grid-cols-2">
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

      <div className="space-y-5">
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

        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold">Files & links</p>
            <p className="mt-1 text-xs text-muted">Attach anything related to the job. It stays visible on the job card so it can be cross-checked.</p>
          </div>
          <div className="space-y-1.5">
            <Label hint="Job description PDF, screenshot of the posting, etc. (max 4 MB in total)">Files</Label>
            <input type="file" name="files" multiple className={FILE_CLS} />
          </div>
          <div className="space-y-1.5">
            <Label>Links</Label>
            <LinkRows rows={links} setRows={setLinks} />
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-4 xl:col-span-2">
        <Button disabled={busy}>{busy && <Loader2 size={14} className="animate-spin" />} Add job</Button>
        {ok && <p className="flex items-center gap-1.5 text-sm text-emerald-400"><Check size={14} /> {ok}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </form>
  );
}
