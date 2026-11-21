"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

const MAX_TOTAL = 4 * 1024 * 1024;
export const FILE_CLS =
  "block w-full rounded-xl border border-dashed border-white/20 bg-black/30 p-3 text-xs text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-black";

// Screenshots are shrunk in the browser so they fit Vercel's ~4.5 MB request limit.
async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.8));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export function useSubmit(url: string, fileFields: string[], onDone?: (form: HTMLFormElement) => void) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData(form);
      let total = 0;
      for (const field of fileFields) {
        const files = await Promise.all(fd.getAll(field).filter((f): f is File => typeof f !== "string" && f.size > 0).map(shrink));
        fd.delete(field);
        files.forEach((f) => fd.append(field, f));
        total += files.reduce((a, f) => a + f.size, 0);
      }
      if (total > MAX_TOTAL) {
        setError("Files are too large (max 4 MB in total).");
        return;
      }
      const res = await fetch(url, { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(j.error ?? `Failed (HTTP ${res.status})`);
        return;
      }
      onDone?.(form);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, submit };
}

export function Rows({
  rows,
  setRows,
  names,
  placeholders,
}: {
  rows: number[];
  setRows: (r: number[]) => void;
  names: [string, string];
  placeholders: [string, string];
}) {
  return (
    <div className="space-y-2">
      {rows.map((id) => (
        <div key={id} className="flex gap-2">
          <Input name={names[0]} placeholder={placeholders[0]} className="w-2/5" />
          <Input name={names[1]} placeholder={placeholders[1]} />
          <Button type="button" variant="ghost" size="icon" onClick={() => setRows(rows.filter((x) => x !== id))} aria-label="Remove"><X size={14} /></Button>
        </div>
      ))}
      <Button type="button" variant="glass" size="sm" onClick={() => setRows([...rows, (rows.at(-1) ?? 0) + 1])}>
        <Plus size={14} /> Add row
      </Button>
    </div>
  );
}

export const FieldRows = (p: { rows: number[]; setRows: (r: number[]) => void; keyPh: string; valPh: string }) => (
  <Rows rows={p.rows} setRows={p.setRows} names={["cfKey", "cfValue"]} placeholders={[p.keyPh, p.valPh]} />
);
export const LinkRows = (p: { rows: number[]; setRows: (r: number[]) => void }) => (
  <Rows rows={p.rows} setRows={p.setRows} names={["lnLabel", "lnUrl"]} placeholders={["Label (e.g. Portfolio link)", "https://…"]} />
);

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <p className="text-xs font-medium">{children}</p>
      {hint && <p className="text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

export function PrepareForm({ jobId }: { jobId: string }) {
  const { busy, error, submit } = useSubmit(`/api/jobs/${jobId}/prepare`, ["other"]);
  const [fields, setFields] = useState<number[]>([1]);
  const [links, setLinks] = useState<number[]>([]);
  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <div className="space-y-1.5">
        <Label hint="What you changed in the CV and anything the owner should check.">Notes</Label>
        <Textarea name="notes" placeholder="e.g. Tailored summary and skills to the React requirements" />
      </div>
      <div className="space-y-1.5">
        <Label hint="The cover letter or written answers you will submit.">Cover letter / answers</Label>
        <Textarea name="coverLetter" />
      </div>
      <div className="space-y-1.5">
        <Label hint="Every field you will fill in on the application form, with the value you will enter.">Application form fields</Label>
        <FieldRows rows={fields} setRows={setFields} keyPh="Field (e.g. Expected salary)" valPh="Value" />
      </div>
      <div className="space-y-1.5">
        <Label hint="Anything else you will attach or use: portfolio files, certificates, extra documents.">Other files</Label>
        <input type="file" name="other" multiple className={FILE_CLS} />
      </div>
      <div className="space-y-1.5">
        <Label hint="Any links you will use or submit (portfolio, GitHub, project demos…).">Links</Label>
        <LinkRows rows={links} setRows={setLinks} />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button variant="glass" size="sm" disabled={busy}>
        {busy && <Loader2 size={14} className="animate-spin" />} Submit for approval
      </Button>
    </form>
  );
}

export function AppliedForm({ jobId }: { jobId: string }) {
  const { busy, error, submit } = useSubmit(`/api/jobs/${jobId}/applied`, ["proof", "other"]);
  const [links, setLinks] = useState<number[]>([]);
  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <div className="space-y-1.5">
        <Label hint="How exactly was the application submitted?">Method *</Label>
        <Input name="method" list="apply-methods" placeholder="e.g. LinkedIn Easy Apply" required />
        <datalist id="apply-methods">
          <option value="Platform Easy Apply" />
          <option value="Company website form" />
          <option value="Email" />
          <option value="Other" />
        </datalist>
      </div>
      <div className="space-y-1.5">
        <Label hint="Confirmation message, reference number or the email you sent.">Confirmation</Label>
        <Textarea name="confirmation" placeholder="e.g. “Your application was sent”. Ref #12345" />
      </div>
      <div className="space-y-1.5">
        <Label hint="Which CV was used and how it was attached.">CV attached</Label>
        <Input name="cvAttached" placeholder="e.g. Uploaded the customised PDF in the resume field" />
      </div>
      <div className="space-y-1.5">
        <Label hint="Screenshots of the confirmation / submitted form. Images are shrunk automatically.">Proof screenshots</Label>
        <input type="file" name="proof" multiple accept="image/*,.pdf" className={FILE_CLS} />
        <Input name="proofUrl" placeholder="…or a proof link" />
      </div>
      <div className="space-y-1.5">
        <Label hint="Any other file or link used while applying (the exact CV sent, the email, etc.).">Other files & links</Label>
        <input type="file" name="other" multiple className={FILE_CLS} />
        <LinkRows rows={links} setRows={setLinks} />
      </div>
      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea name="notes" placeholder="Anything that went differently from the plan" />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button variant="success" size="sm" disabled={busy}>
        {busy && <Loader2 size={14} className="animate-spin" />} Report as applied
      </Button>
    </form>
  );
}

export function CvForm({ jobId, hasCv }: { jobId: string; hasCv: boolean }) {
  const { busy, error, submit } = useSubmit(`/api/jobs/${jobId}/cv`, ["file"], (form) => form.reset());
  return (
    <form onSubmit={submit} className="mt-3 space-y-3">
      <div className="space-y-1.5">
        <Label hint="Upload the finished CV for this job (PDF/DOCX, max 4 MB).">CV file</Label>
        <input type="file" name="file" accept=".pdf,.doc,.docx" className={FILE_CLS} />
      </div>
      <div className="space-y-1.5">
        <Label hint="Can't upload a file? Paste the full CV text here and it is saved with the job.">…or CV text</Label>
        <Textarea name="text" className="min-h-28" placeholder="Paste the full customised CV text" />
      </div>
      <div className="space-y-1.5">
        <Label>…or a link</Label>
        <Input name="link" placeholder="https://…" />
      </div>
      <div className="space-y-1.5">
        <Label>What was customised (optional)</Label>
        <Input name="note" placeholder="e.g. Reordered skills for React, rewrote summary" />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button variant="glass" size="sm" disabled={busy}>
        {busy && <Loader2 size={14} className="animate-spin" />} {hasCv ? "Replace CV" : "Save CV"}
      </Button>
    </form>
  );
}
