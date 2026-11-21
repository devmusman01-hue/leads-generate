"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Upload } from "lucide-react";
import { saveInstructions } from "@/actions/template";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";

export function TemplateUpload() {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    let res: Response | undefined;
    let j: { error?: string; filename?: string; extracted?: boolean } = {};
    try {
      res = await fetch("/api/template", { method: "POST", body: new FormData(e.currentTarget) });
      j = await res.json().catch(() => ({}));
    } catch {
      setBusy(false);
      setMsg({ ok: false, text: "Network error. Could not reach the server." });
      return;
    }
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: `Uploaded ${j.filename ?? "file"}. ${j.extracted ? "Text and placeholders extracted for the agent." : "No readable text extracted from this file type (DOCX works best)."}` });
      ref.current?.reset();
      router.refresh();
    } else setMsg({ ok: false, text: j.error ?? `Upload failed (HTTP ${res.status})` });
  }

  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-4">
      <input type="file" name="file" accept=".pdf,.doc,.docx,.tex,.odt,.txt,.md" required className="block w-full rounded-xl border border-dashed border-white/20 bg-black/30 p-4 text-sm text-muted file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-black" />
      <Button disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {busy ? "Uploading…" : "Upload (max 4 MB)"}</Button>
      {msg && <p className={`text-sm ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>{msg.text}</p>}
    </form>
  );
}


export function InstructionsForm({ initial }: { initial: string }) {
  const [state, action] = useActionState(saveInstructions, undefined);
  return (
    <form action={action} className="space-y-4">
      <Textarea
        name="instructions"
        defaultValue={initial}
        className="min-h-40"
        placeholder={"Tell the agent how to use this template, e.g.\n- Keep the layout and fonts untouched\n- Rewrite the Summary and Skills sections for each job\n- Replace {{full_name}}, {{email}}, {{phone}} from my Profile\n- Never invent experience"}
      />
      <div className="flex items-center gap-4">
        <SubmitButton variant="glass" pendingText="Saving…">Save instructions</SubmitButton>
        {state?.ok && <p className="flex items-center gap-1.5 text-sm text-emerald-400"><Check size={14} /> Saved</p>}
      </div>
    </form>
  );
}
