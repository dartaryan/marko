"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignInButton } from "@clerk/nextjs";
import { FileText, Languages, ListChecks, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useCapabilities } from "@/lib/hooks/useCapabilities";
import { UpgradePrompt } from "@/components/auth/UpgradePrompt";
import { cn } from "@/lib/utils";
import type { AiActionType } from "@/types/ai";

const AI_ACTIONS: {
  type: AiActionType;
  label: string;
  icon: typeof FileText;
}[] = [
  { type: "summarize", label: "סכם את המסמך", icon: FileText },
  { type: "translate", label: "תרגם לאנגלית", icon: Languages },
  { type: "extractActions", label: "חלץ משימות", icon: ListChecks },
  { type: "improveWriting", label: "שפר ניסוח", icon: Sparkles },
];

interface AiCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (actionType: AiActionType, forceOpus: boolean) => void;
}

export function AiCommandPalette({
  open,
  onOpenChange,
  onAction,
}: AiCommandPaletteProps) {
  const { isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const { capabilities } = useCapabilities();
  const [forceOpus, setForceOpus] = useState(false);

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

  function handleAction(actionType: AiActionType) {
    onAction(actionType, forceOpus);
    onOpenChange(false);
  }

  // Reset forceOpus when palette closes
  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      setForceOpus(false);
    }
    onOpenChange(newOpen);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="פעולות AI"
      description="בחר פעולת AI לביצוע על המסמך"
      showCloseButton={false}
    >
      <div dir="rtl">
        <CommandInput
          dir="rtl"
          placeholder="...חפש פעולה"
          aria-label="חפש פעולת AI"
        />
        <CommandList>
          <CommandEmpty>לא נמצאו פעולות</CommandEmpty>

          {!authLoading && !isAuthenticated && (
            <div
              className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted-foreground"
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

          {isAuthenticated && (
            <CommandGroup heading="פעולות AI">
              {AI_ACTIONS.map(({ type, label, icon: Icon }) => (
                <CommandItem
                  key={type}
                  onSelect={() => handleAction(type)}
                  disabled={isAtLimit || isUsageLoading}
                  aria-label={label}
                  aria-disabled={isAtLimit || isUsageLoading ? "true" : undefined}
                  title={isAtLimit ? "הגעת למגבלת השימוש החודשית" : undefined}
                  data-testid={`ai-action-${type}`}
                >
                  <Icon className="me-2 h-4 w-4" />
                  {label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {isAuthenticated && capabilities.canUseOpus && (
            <div
              className="flex items-center justify-between border-t border-border px-4 py-2"
              dir="rtl"
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
                className={cn(
                  "text-xs",
                  opusRemaining === null || opusRemaining <= 0 ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {opusRemaining ?? 0}/{opusUsage?.limit ?? 5}
              </span>
            </div>
          )}

          {isAuthenticated && isAtLimit && (
            <div
              className="border-t border-border p-4 text-center text-sm text-muted-foreground"
              data-testid="ai-limit-gate"
            >
              <p className="mb-3">
                ניצלת את כל פעולות ה-AI החינמיות החודש. שדרג לגישה בלתי מוגבלת
                ל-AI.
              </p>
              <UpgradePrompt variant="palette" />
            </div>
          )}

          {isAuthenticated &&
            !isAtLimit &&
            remaining !== null &&
            remaining > 0 && (
              <div
                className="border-t border-border px-4 py-2 text-center text-xs text-muted-foreground"
                data-testid="ai-remaining-count"
                aria-live="polite"
              >
                נותרו {remaining} פעולות AI
              </div>
            )}
        </CommandList>
      </div>
    </CommandDialog>
  );
}
