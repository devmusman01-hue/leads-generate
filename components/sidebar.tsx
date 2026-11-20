"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crosshair, FilePlus2, FileUser, LayoutDashboard, LogOut, Mail, Menu, Radar, UserRound, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Received with email", icon: Mail },
  { href: "/add-job", label: "Add job", icon: FilePlus2 },
  { href: "/focus", label: "Focus keywords", icon: Crosshair },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/template", label: "Upload a template", icon: FileUser },
];

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="float-icon flex h-10 w-10 items-center justify-center bg-accent/20 text-accent">
        <Radar size={20} />
      </div>
      <div>
        <p className="text-sm font-semibold leading-none">Leads Gen</p>
        <p className="mt-1 text-[11px] text-muted">Agent control room</p>
      </div>
    </div>
  );
}

export function Sidebar({ logout }: { logout: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="glass sticky top-0 z-30 flex items-center justify-between border-x-0 border-t-0 px-4 py-3 md:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <Menu size={18} />
          </button>
        </div>
      </div>
      {open && <div className="fixed inset-0 z-40 bg-black/70 md:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={cn(
          "glass fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-y-0 border-l-0 p-5 transition-transform max-md:bg-background! md:sticky md:top-0 md:z-auto md:h-screen md:w-72 md:shrink-0 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-8 flex items-start justify-between">
          <Logo />
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="cursor-pointer p-1 text-muted md:hidden">
            <X size={18} />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {NAV.map(({ href, label, icon: Icon }, i) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-foreground",
                  active && "border-white/10 bg-white/[0.07] text-foreground",
                )}
              >
                <span
                  className={cn("float-icon flex h-9 w-9 items-center justify-center bg-white/5", active && "bg-accent/25 text-accent")}
                  style={{ animationDelay: `${i * 0.6}s` }}
                >
                  <Icon size={17} />
                </span>
                {label}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle withLabel />
        <form action={logout}>
          <button className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-white/5 hover:text-foreground">
            <LogOut size={16} /> Sign out
          </button>
        </form>
      </aside>
    </>
  );
}
