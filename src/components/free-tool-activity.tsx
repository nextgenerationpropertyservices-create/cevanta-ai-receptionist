"use client";

import { useEffect } from "react";
import { recordFreeToolOpen } from "@/app/actions/free-tool-activity";

export function FreeToolActivity({ tenantId }: { tenantId: string }) {
  useEffect(() => {
    let lastAttempt = 0;
    function recordVisibleOpen() {
      const now = Date.now();
      if (document.visibilityState === "visible" && now - lastAttempt >= 15 * 60_000) {
        lastAttempt = now;
        void recordFreeToolOpen(tenantId).catch(() => {
          // An unavailable activity report should not interrupt workspace use.
        });
      }
    }

    recordVisibleOpen();
    document.addEventListener("visibilitychange", recordVisibleOpen);
    return () => document.removeEventListener("visibilitychange", recordVisibleOpen);
  }, [tenantId]);

  return null;
}
