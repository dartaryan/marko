"use client";

import { useCallback, useSyncExternalStore } from "react";

const SESSION_KEY = "marko-ai-disclosure-accepted";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("ai-disclosure-change", onStoreChange);
  return () => {
    window.removeEventListener("ai-disclosure-change", onStoreChange);
  };
}

function getSnapshot(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) !== "true";
  } catch {
    return true;
  }
}

function getServerSnapshot(): boolean {
  return true;
}

export function useAiDisclosure() {
  const needsDisclosure = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const acceptDisclosure = useCallback(() => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // Silently fail — disclosure will show again next action
    }
    window.dispatchEvent(new Event("ai-disclosure-change"));
  }, []);

  return { needsDisclosure, acceptDisclosure };
}
