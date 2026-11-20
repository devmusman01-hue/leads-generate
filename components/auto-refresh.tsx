"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Quietly re-fetches server data (no page reload) so changes made elsewhere (e.g. by the agent) show up live.
export function AutoRefresh({ seconds = 8 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
