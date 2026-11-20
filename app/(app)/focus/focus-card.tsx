import { Crosshair, Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { getFocus } from "@/lib/focus";
import { addKeywords, removeKeyword, saveFocusNotes } from "@/actions/profile";

function KeywordBox({ kind, title, hint, items, tone }: { kind: "include" | "exclude"; title: string; hint: string; items: string[]; tone: string }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted">{hint}</p>
      </div>
      <div className="flex min-h-9 flex-wrap gap-2">
        {items.length === 0 && <span className="text-xs text-muted">None yet</span>}
        {items.map((k) => (
          <form key={k} action={removeKeyword}>
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="value" value={k} />
            <button className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${tone}`} title="Remove">
              {k} <X size={12} />
            </button>
          </form>
        ))}
      </div>
      <form action={addKeywords} className="flex gap-2">
        <input type="hidden" name="kind" value={kind} />
        <Input name="text" placeholder="Add keywords, separate with commas" />
        <SubmitButton variant="glass" size="icon" aria-label="Add"><Plus size={14} /></SubmitButton>
      </form>
    </div>
  );
}

export async function FocusCard() {
  const f = await getFocus();
  return (
    <Card className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="float-icon flex h-11 w-11 shrink-0 items-center justify-center bg-accent/20 text-accent"><Crosshair size={20} /></div>
        <div>
          <h2 className="font-semibold">Focus keywords / Search keywords</h2>
          <p className="mt-1 text-sm text-muted">
            <span className="font-medium text-accent">Instruction for the AI agent:</span> these are the main areas and scope of jobs to add.
            Only add jobs that match the include keywords. Do not add jobs that are irrelevant or match the exclude keywords.
          </p>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <KeywordBox kind="include" title="Include (roles, skills, areas)" hint="Jobs must relate to these." items={f.include} tone="border-emerald-400/30 bg-emerald-400/10 text-emerald-300" />
        <KeywordBox kind="exclude" title="Exclude (avoid these)" hint="Never add jobs about these." items={f.exclude} tone="border-red-400/30 bg-red-400/10 text-red-300" />
      </div>
      <form action={saveFocusNotes} className="space-y-3 border-t border-white/10 pt-5">
        <p className="text-sm font-medium">Extra notes for the agent</p>
        <Textarea name="notes" defaultValue={f.notes} placeholder="e.g. Remote only. Junior to mid level. Minimum salary. Preferred countries…" />
        <SubmitButton variant="glass" size="sm" pendingText="Saving…">Save notes</SubmitButton>
      </form>
    </Card>
  );
}
