"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Check, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { renderMarkdown } from "@/lib/markdown/render-pipeline";
import type { AiResponse } from "@/types/ai";

interface AiSuggestionCardProps {
  isLoading: boolean;
  result: AiResponse | null;
  onAccept: (text: string) => void;
  onDismiss: () => void;
  onRegenerate?: () => void;
  /** Whether to show partial result with blur (paywall) */
  isBlurred?: boolean;
}

export function AiSuggestionCard({
  isLoading,
  result,
  onAccept,
  onDismiss,
  onRegenerate,
  isBlurred = false,
}: AiSuggestionCardProps) {
  const [accepted, setAccepted] = useState(false);
  const acceptTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (acceptTimerRef.current) clearTimeout(acceptTimerRef.current);
    };
  }, []);

  const html = useMemo(() => {
    if (!result?.result) return "";
    return DOMPurify.sanitize(renderMarkdown(result.result, false));
  }, [result]);

  function handleAccept() {
    if (!result?.result) return;
    setAccepted(true);
    onAccept(result.result);
    acceptTimerRef.current = setTimeout(() => setAccepted(false), 300);
  }

  if (!isLoading && !result) return null;

  return (
    <div
      role="complementary"
      aria-label="הצעת AI"
      dir="rtl"
      className="marko-suggestion-card animate-slide-down"
      data-testid="ai-suggestion-card"
    >
      {/* Gradient inline-start border */}
      <div className="marko-suggestion-card-border" aria-hidden="true" />

      <div className="marko-suggestion-card-content">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="p-4 space-y-3" data-testid="ai-loading-skeleton">
            <p className="text-sm text-muted-foreground animate-pulse">
              ...מעבד
            </p>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
              <div className="h-4 w-4/6 rounded bg-muted animate-pulse" />
              <div className="h-4 w-3/6 rounded bg-muted animate-pulse" />
            </div>
          </div>
        )}

        {/* Result */}
        {!isLoading && result && (
          <>
            <div className={`relative ${isBlurred ? "marko-ai-result-blurred" : ""}`}>
              <div
                className="preview-content overflow-y-auto p-4 max-h-64"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 border-t border-border px-4 py-2">
              <Button
                size="sm"
                onClick={handleAccept}
                aria-label="הכנס לעורך"
                data-testid="ai-accept-btn"
                disabled={isBlurred}
              >
                <Check className="me-1 h-4 w-4" />
                {accepted ? "הוכנס!" : "הכנס לעורך"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
                aria-label="סגור"
                data-testid="ai-dismiss-btn"
              >
                <X className="me-1 h-4 w-4" />
                סגור
              </Button>
              {onRegenerate && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRegenerate}
                  aria-label="נסה שוב"
                  data-testid="ai-regenerate-btn"
                  disabled={isBlurred}
                >
                  <RefreshCw className="me-1 h-4 w-4" />
                  נסה שוב
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
