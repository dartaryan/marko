"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCallback } from "react";

export function useAnalytics() {
  const trackMutation = useMutation(api.analytics.trackEvent);

  const track = useCallback(
    (event: string, metadata?: Record<string, unknown>) => {
      // Fire and forget — never await, never throw
      trackMutation({ event, metadata }).catch(() => {
        // Silently ignore — analytics failures must never affect UX
      });
    },
    [trackMutation]
  );

  return { track };
}
