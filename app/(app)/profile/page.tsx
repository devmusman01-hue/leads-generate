import { Suspense } from "react";
import { Download, Plus, Save, Trash2, UserRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/submit-button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { getSections } from "@/lib/profile";
import type { ProfileSection } from "@/lib/types";
import * as A from "@/actions/profile";

function SectionCard({ s }: { s: ProfileSection }) {
  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-2">
        <form action={A.renameSection} className="flex flex-1 gap-2">
          <input type="hidden" name="sectionId" value={s.id} />
          <Input name="name" defaultValue={s.name} className="max-w-xs font-semibold" />
          <SubmitButton variant="ghost" size="icon" title="Rename"><Save size={14} /></SubmitButton>
        </form>
        <span className="text-xs text-muted">{s.type === "fields" ? "Fields" : "List"}</span>
        <form action={A.deleteSection}>
          <input type="hidden" name="sectionId" value={s.id} />
          <SubmitButton variant="destructive" size="icon" title="Delete section"><Trash2 size={14} /></SubmitButton>
        </form>
      </div>

      {s.type === "fields" ? (
        <div className="space-y-3">
          {s.fields.map((f) => (
            <form key={f.id} action={A.saveField} className="flex flex-col gap-2 sm:flex-row">
              <input type="hidden" name="sectionId" value={s.id} />
              <input type="hidden" name="id" value={f.id} />
              <Input name="label" defaultValue={f.label} className="sm:w-44 sm:shrink-0 text-muted" />
              <Input name="value" defaultValue={f.value} />
              <SubmitButton variant="ghost" size="icon" title="Save"><Save size={14} /></SubmitButton>
              <SubmitButton variant="ghost" size="icon" title="Delete" formAction={A.deleteField}><Trash2 size={14} /></SubmitButton>
            </form>
          ))}
          <form action={A.addField} className="flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row">
            <input type="hidden" name="sectionId" value={s.id} />
            <Input name="label" placeholder="Label (e.g. Email)" className="sm:w-44 sm:shrink-0" required />
            <Input name="value" placeholder="Value" />
            <SubmitButton variant="glass"><Plus size={14} /> Add</SubmitButton>
          </form>
        </div>
      ) : (
        <div className="space-y-3">
          {s.items.map((it) => (
            <form key={it.id} action={A.saveItem} className="space-y-3 border border-white/10 p-4">
              <input type="hidden" name="sectionId" value={s.id} />
              <input type="hidden" name="id" value={it.id} />
              <div className="grid gap-2 sm:grid-cols-3">
                <Input name="title" defaultValue={it.title} placeholder="Title" />
                <Input name="subtitle" defaultValue={it.subtitle} placeholder="Subtitle / tech stack" />
                <Input name="link" defaultValue={it.link} placeholder="Link" />
              </div>
              <Textarea name="description" defaultValue={it.description} placeholder="Description" />
              <div className="flex flex-col gap-2 sm:flex-row">
                <SubmitButton variant="glass" size="sm"><Save size={14} /> Save</SubmitButton>
                <SubmitButton variant="destructive" size="sm" formAction={A.deleteItem}><Trash2 size={14} /> Remove</SubmitButton>
              </div>
            </form>
          ))}
          <form action={A.addItem} className="space-y-3 border border-dashed border-white/15 p-4">
            <input type="hidden" name="sectionId" value={s.id} />
            <div className="grid gap-2 sm:grid-cols-3">
              <Input name="title" placeholder="Title (e.g. Project name)" required />
              <Input name="subtitle" placeholder="Subtitle / tech stack" />
              <Input name="link" placeholder="Link" />
            </div>
            <Textarea name="description" placeholder="Description" />
            <SubmitButton variant="glass" size="sm"><Plus size={14} /> Add entry</SubmitButton>
          </form>
        </div>
      )}
    </Card>
  );
}

async function Sections() {
  const sections = await getSections();
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,440px),1fr))] items-start gap-5">
      {sections.length === 0 && (
        <Card className="col-span-full text-sm text-muted">No sections yet. Create one below, e.g. “Personal Information” (fields) or “Projects” (list).</Card>
      )}
      {sections.map((s) => <SectionCard key={s.id} s={s} />)}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        icon={UserRound}
        help="profile"
        actions={<form action={A.importStarterProfile}><SubmitButton size="sm" pendingText="Importing…"><Download size={14} /> Import from CV</SubmitButton></form>}
        title="Profile" subtitle="Everything your agent knows about you, organised in sections you define." />
      <Card className="mb-6">
        <form action={A.createSection} className="flex flex-wrap gap-2">
          <Input name="name" placeholder="New section name (e.g. Personal Information)" className="max-w-sm" required />
          <Select name="type" className="sm:w-56">
            <option value="fields">Key / value fields</option>
            <option value="items">List of entries (projects…)</option>
          </Select>
          <SubmitButton><Plus size={14} /> Create section</SubmitButton>
        </form>
      </Card>
      <Suspense fallback={<p className="text-sm text-muted">Loading profile…</p>}>
        <Sections />
      </Suspense>
    </>
  );
}
