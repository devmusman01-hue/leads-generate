import type { LucideIcon } from "lucide-react";
import { HELP, type HelpKey } from "@/lib/page-help";
import { InfoDrawer } from "@/components/info-drawer";

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  help,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  help: HelpKey;
  actions?: React.ReactNode;
}) {
  return (
    <header className="glass relative mb-8 flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl px-5 py-5 sm:px-7">
      <div className="absolute inset-y-0 left-0 w-1 bg-accent" />
      <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative flex items-center gap-4">
        <div className="float-icon flex h-12 w-12 shrink-0 items-center justify-center bg-accent/20 text-accent">
          <Icon size={22} />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      <div className="relative flex items-center gap-2">
        {actions}
        <InfoDrawer help={HELP[help]} />
      </div>
    </header>
  );
}
