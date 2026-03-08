"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UpgradePromptProps {
  variant?: "inline" | "palette";
  className?: string;
}

export function UpgradePrompt({
  variant = "inline",
  className,
}: UpgradePromptProps) {
  const handleUpgrade = () => {
    // Phase 1: Placeholder — no payment flow yet
    toast.info("שדרוג יהיה זמין בקרוב!");
  };

  return (
    <div dir="rtl" className={className}>
      <Button
        onClick={handleUpgrade}
        aria-label="שדרג לגישה בלתי מוגבלת ל-AI"
        variant={variant === "palette" ? "default" : "outline"}
        size={variant === "palette" ? "sm" : "default"}
      >
        שדרג עכשיו
      </Button>
    </div>
  );
}
