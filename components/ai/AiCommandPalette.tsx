"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignInButton } from "@clerk/nextjs";
import { FileText, Languages, ListChecks, Sparkles } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { UpgradePrompt } from "@/components/auth/UpgradePrompt";
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
  onAction: (actionType: AiActionType) => void;
}

export function AiCommandPalette({
  open,
  onOpenChange,
  onAction,
}: AiCommandPaletteProps) {
  const { isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const usage = useQuery(
    api.usage.getMyMonthlyUsage,
    isAuthenticated ? {} : "skip"
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

  function handleAction(actionType: AiActionType) {
    onAction(actionType);
    onOpenChange(false);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
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
