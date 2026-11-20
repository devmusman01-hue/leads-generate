"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ withLabel = false, className }: { withLabel?: boolean; className?: string }) {
  function toggle() {
    const el = document.documentElement;
    const next = el.dataset.theme === "light" ? "dark" : "light";
    el.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light/dark theme"
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl text-sm text-muted transition-colors hover:bg-white/5 hover:text-foreground",
        withLabel ? "w-full px-3 py-2.5" : "h-10 w-10 justify-center border border-white/10 bg-white/5",
        className,
      )}
    >
      <Sun size={16} className="theme-sun" />
      <Moon size={16} className="theme-moon" />
      {withLabel && (
        <>
          <span className="theme-sun">Light mode</span>
          <span className="theme-moon">Dark mode</span>
        </>
      )}
    </button>
  );
}
