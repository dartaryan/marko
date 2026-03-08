"use client";

import { useMemo, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Check, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { renderMarkdown } from "@/lib/markdown/render-pipeline";
import { toast } from "sonner";
import type { AiResponse } from "@/types/ai";

interface AiResultPanelProps {
  isLoading: boolean;
  result: AiResponse | null;
  onAccept: (text: string) => void;
  onDismiss: () => void;
}

export function AiResultPanel({
  isLoading,
  result,
  onAccept,
  onDismiss,
}: AiResultPanelProps) {
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => {
    if (!result?.result) return "";
    return DOMPurify.sanitize(renderMarkdown(result.result, false));
  }, [result]);

  async function handleCopy() {
    if (!result?.result) return;
    try {
      await navigator.clipboard.writeText(result.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("שגיאה בהעתקה. נסה שוב.");
    }
  }

  if (!isLoading && !result) return null;

  return (
    <div
      role="complementary"
      aria-label="תוצאת AI"
      dir="rtl"
      className="border-t border-border bg-muted/30"
      data-testid="ai-result-panel"
    >
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

      {!isLoading && result && (
        <div className="flex flex-col">
          <div
            className="preview-content overflow-y-auto p-4 max-h-64"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <div className="flex items-center gap-2 border-t border-border px-4 py-2">
            <Button
              size="sm"
              onClick={() => onAccept(result.result)}
              aria-label="הכנס לעורך"
              data-testid="ai-accept-btn"
            >
              <Check className="me-1 h-4 w-4" />
              הכנס לעורך
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
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              aria-label="העתק"
              data-testid="ai-copy-btn"
            >
              <Copy className="me-1 h-4 w-4" />
              {copied ? "הועתק!" : "העתק"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
