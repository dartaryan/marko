"use client";

import { useConvexAuth } from "convex/react";
import { SignInButton } from "@clerk/nextjs";

export function AiActionPlaceholder() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div
        className="flex items-center justify-center rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground"
        data-testid="ai-anonymous-prompt"
      >
        <SignInButton mode="modal">
          <button type="button" className="hover:text-foreground transition-colors">
            הירשם בחינם כדי להשתמש ב-AI
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground"
      data-testid="ai-placeholder"
    >
      פעולות AI יהיו זמינות בקרוב
    </div>
  );
}
