"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignInButton } from "@clerk/nextjs";
import {
  FileText,
  Languages,
  ListChecks,
  PenLine,
  X,
} from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useCapabilities } from "@/lib/hooks/useCapabilities";
import { UpgradePrompt } from "@/components/auth/UpgradePrompt";
import type { AiActionType } from "@/types/ai";

const AI_ACTIONS: {
  type: AiActionType;
  label: string;
  icon: typeof FileText;
}[] = [
  { type: "summarize", label: "סכם", icon: FileText },
  { type: "translate", label: "תרגם", icon: Languages },
  { type: "extractActions", label: "צור תרשים", icon: ListChecks },
  { type: "improveWriting", label: "שכתב", icon: PenLine },
];

const PROMINENT_FOR_SELECTION: AiActionType[] = ["translate", "improveWriting"];

export type CommandBarPosition = "below-header" | "above-selection";

interface AiCommandBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (actionType: AiActionType, forceOpus: boolean, freeText?: string) => void;
  position?: CommandBarPosition;
  /** Coordinates for above-selection positioning */
  anchorRect?: { top: number; left: number };
  /** Selected text context (used for contextual display) */
  selectedText?: string;
}

export function AiCommandBar({
  open,
  onOpenChange,
  onAction,
  position = "below-header",
  anchorRect,
  selectedText,
}: AiCommandBarProps) {
  const { isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const { capabilities } = useCapabilities();
  const [forceOpus, setForceOpus] = useState(false);
  const [freeText, setFreeText] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const usage = useQuery(
    api.usage.getMyMonthlyUsage,
    isAuthenticated ? {} : "skip"
  );

  const opusUsage = useQuery(
    api.usage.getMyDailyOpusUsage,
    isAuthenticated && capabilities.canUseOpus ? {} : "skip"
  );

  const isUsageLoading = isAuthenticated && usage === undefined;
  const isAtLimit =
    usage !== undefined &&
    usage.limit !== null &&
    usage.count >= usage.limit;

  const remaining =
    usage !== undefined && usage.limit !== null
      ? usage.limit - usage.count
      : null;

  const opusRemaining =
    opusUsage !== undefined && capabilities.canUseOpus
      ? opusUsage.limit - opusUsage.count
      : null;

  // When selected text is provided, promote Translate and Improve Writing to the front
  const orderedActions = useMemo(() => {
    if (!selectedText) return AI_ACTIONS;
    return [...AI_ACTIONS].sort((a, b) => {
      const aP = PROMINENT_FOR_SELECTION.includes(a.type) ? 0 : 1;
      const bP = PROMINENT_FOR_SELECTION.includes(b.type) ? 0 : 1;
      return aP - bP;
    });
  }, [selectedText]);

  // Focus management: focus the bar when it opens
  useEffect(() => {
    if (open) {
      setFocusedIndex(0);
      setFreeText("");
      setForceOpus(false);
      requestAnimationFrame(() => {
        const firstChip = barRef.current?.querySelector<HTMLElement>(
          "[data-ai-chip]"
        );
        firstChip?.focus();
      });
    }
  }, [open]);

  // Escape closes bar
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Click outside closes bar
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onOpenChange]);

  function handleAction(actionType: AiActionType, customText?: string) {
    onAction(actionType, forceOpus, customText);
    onOpenChange(false);
  }

  function handleChipKeyDown(e: React.KeyboardEvent, index: number) {
    const chipCount = orderedActions.length;
    if (e.key === "ArrowLeft") {
      // RTL: ArrowLeft goes to next
      e.preventDefault();
      const next = (index + 1) % chipCount;
      setFocusedIndex(next);
      barRef.current
        ?.querySelectorAll<HTMLElement>("[data-ai-chip]")
        [next]?.focus();
    } else if (e.key === "ArrowRight") {
      // RTL: ArrowRight goes to previous
      e.preventDefault();
      const prev = (index - 1 + chipCount) % chipCount;
      setFocusedIndex(prev);
      barRef.current
        ?.querySelectorAll<HTMLElement>("[data-ai-chip]")
        [prev]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleAction(orderedActions[index].type);
    }
  }

  if (!open) return null;

  const positionStyles: React.CSSProperties =
    position === "above-selection" && anchorRect
      ? {
          position: "fixed",
          top: anchorRect.top,
          // Physical left is correct for fixed positioning (viewport coords from getBoundingClientRect)
          left: anchorRect.left,
          zIndex: "var(--z-dropdown)" as unknown as number,
        }
      : {};

  return (
    <div
      ref={barRef}
      dir="rtl"
      role="dialog"
      aria-label="פעולות AI"
      className={`marko-ai-command-bar animate-slide-down ${
        position === "below-header"
          ? "marko-ai-command-bar--header"
          : "marko-ai-command-bar--selection"
      }`}
      style={positionStyles}
      data-testid="ai-command-bar"
    >
      {/* Anonymous gate */}
      {!authLoading && !isAuthenticated && (
        <div
          className="flex flex-col items-center gap-2 p-4 text-center text-sm text-muted-foreground"
          data-testid="ai-anonymous-gate"
        >
          <p>הירשם בחינם כדי להשתמש ב-AI</p>
          <SignInButton mode="modal">
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              הרשמה
            </button>
          </SignInButton>
        </div>
      )}

      {/* Authenticated: action chips + controls */}
      {isAuthenticated && (
        <>
          <div className="flex flex-wrap items-center gap-2 p-3">
            {/* Chips in a semantic listbox */}
            <div
              className="flex flex-wrap items-center gap-2"
              role="listbox"
              aria-label="פעולות AI"
            >
              {orderedActions.map(({ type, label, icon: Icon }, index) => (
                <button
                  key={type}
                  type="button"
                  role="option"
                  data-ai-chip
                  aria-label={label}
                  aria-selected={focusedIndex === index}
                  aria-disabled={isAtLimit || isUsageLoading}
                  disabled={isAtLimit || isUsageLoading}
                  tabIndex={focusedIndex === index ? 0 : -1}
                  className="marko-ai-chip"
                  onClick={() => handleAction(type)}
                  onKeyDown={(e) => handleChipKeyDown(e, index)}
                  data-testid={`ai-action-${type}`}
                >
                  <Icon className="size-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Free-text input */}
            <div className="flex-1 min-w-[120px]">
              <input
                ref={inputRef}
                type="text"
                dir="rtl"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-faint outline-none"
                placeholder="...או כתוב הוראה חופשית"
                aria-label="הוראה חופשית ל-AI"
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && freeText.trim()) {
                    handleAction("improveWriting", freeText.trim());
                  }
                }}
                disabled={isAtLimit || isUsageLoading}
              />
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="סגור"
              className="marko-toolbar-btn ms-auto"
              style={{ minHeight: 32, minWidth: 32 }}
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Opus toggle for paid users */}
          {capabilities.canUseOpus && (
            <div
              className="flex items-center justify-between border-t border-border px-3 py-2"
              data-testid="opus-toggle"
            >
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={forceOpus}
                  onChange={(e) => setForceOpus(e.target.checked)}
                  disabled={opusRemaining === null || opusRemaining <= 0}
                  className="rounded"
                  aria-label="ניתוח מעמיק — שימוש במודל Opus"
                />
                <span>ניתוח מעמיק</span>
              </label>
              <span
                dir="ltr"
                className="text-xs text-muted-foreground"
              >
                {opusRemaining ?? 0}/{opusUsage?.limit ?? 5}
              </span>
            </div>
          )}

          {/* At-limit upgrade gate */}
          {isAtLimit && (
            <div
              className="border-t border-border p-3 text-center text-sm text-muted-foreground"
              data-testid="ai-limit-gate"
            >
              <p className="mb-2">רוצה עוד? שדרג לפרימיום</p>
              <UpgradePrompt variant="palette" />
            </div>
          )}

          {/* Remaining count */}
          {!isAtLimit && remaining !== null && remaining > 0 && (
            <div
              className="border-t border-border px-3 py-1.5 text-center text-xs text-muted-foreground"
              data-testid="ai-remaining-count"
              aria-live="polite"
            >
              נותרו {remaining} פעולות AI
            </div>
          )}

          {/* Context indicator for selection */}
          {selectedText && (
            <div className="border-t border-border px-3 py-1.5 text-xs text-foreground-faint truncate">
              הקשר: &ldquo;{selectedText.slice(0, 60)}
              {selectedText.length > 60 ? "..." : ""}&rdquo;
            </div>
          )}
        </>
      )}
    </div>
  );
}
