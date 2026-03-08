"use client";

import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { AiActionType, AiResponse } from "@/types/ai";

export function useAiAction() {
  const callAi = useAction(api.ai.callAnthropicApi);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const executeAction = useCallback(
    async (
      actionType: AiActionType,
      content: string,
      targetLanguage?: "he" | "en"
    ) => {
      if (isLoading) return null;
      setIsLoading(true);
      setError(null);
      setErrorCode(null);
      setResult(null);
      try {
        const response = await callAi({ actionType, content, targetLanguage });
        setResult(response);
        toast.success("AI סיים לעבד");
        return response;
      } catch (err: unknown) {
        const errorData = (err as { data?: { code?: string; message?: string } })?.data;
        const message = errorData?.message || "שגיאה בעיבוד AI";
        const code = errorData?.code || null;
        setError(message);
        setErrorCode(code);
        toast.error(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [callAi, isLoading]
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
    setErrorCode(null);
  }, []);

  return { executeAction, isLoading, result, error, errorCode, clearResult };
}
