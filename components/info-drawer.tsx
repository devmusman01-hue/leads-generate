"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Info, X } from "lucide-react";
import type { Help } from "@/lib/page-help";
import { Button } from "@/components/ui/button";

export function InfoDrawer({ help }: { help: Help }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <Button type="button" variant="glass" size="sm" onClick={() => setOpen(true)}>
        <Info size={15} /> Get info
      </Button>
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60]">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <aside className="slide-in absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/10 bg-background shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="float-icon flex h-10 w-10 items-center justify-center bg-accent/20 text-accent"><Info size={18} /></div>
                  <div>
                    <p className="text-xs text-muted">About this page</p>
                    <h2 className="font-semibold leading-tight">{help.title}</h2>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close" className="cursor-pointer rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-foreground">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto p-5">
                <p className="text-sm leading-relaxed">{help.about}</p>
                {help.sections.map((s) => (
                  <section key={s.heading}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">{s.heading}</h3>
                    <ul className="space-y-2 text-sm text-muted">
                      {s.items.map((it) => (
                        <li key={it} className="flex gap-2.5 leading-relaxed">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
