"use client";

import { Button } from "@/components/ui/button";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface UpgradePromptProps {
  variant?: "inline" | "palette";
  className?: string;
}

export function UpgradePrompt({
  variant = "inline",
  className,
}: UpgradePromptProps) {
  const createCheckout = useAction(api.stripe.createCheckoutSession);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const { url } = await createCheckout();
      window.location.href = url;
    } catch (err: unknown) {
      const errorData = (err as { data?: { code?: string; message?: string } })
        ?.data;
      const message = errorData?.message || "שגיאה ביצירת דף התשלום";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className={className}>
      <Button
        onClick={handleUpgrade}
        disabled={isLoading}
        aria-label="שדרג לגישה בלתי מוגבלת ל-AI"
        variant={variant === "palette" ? "default" : "outline"}
        size={variant === "palette" ? "sm" : "default"}
      >
        {isLoading ? "מעבד..." : "שדרג עכשיו"}
      </Button>
    </div>
  );
}
