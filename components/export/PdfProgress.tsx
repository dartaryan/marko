'use client';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface PdfProgressProps {
  state: 'generating' | 'success' | 'error';
  onRetry: () => void;
  onClose: () => void;
  onPrint?: () => void;
}

export function PdfProgress({ state, onRetry, onClose, onPrint }: PdfProgressProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 end-4 z-50 flex items-center gap-3 rounded-lg border border-border bg-popover px-4 py-3 shadow-lg"
    >
      {state === 'generating' && (
        <>
          <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
          <span className="text-sm">...מייצר PDF</span>
        </>
      )}
      {state === 'success' && (
        <>
          <CheckCircle2 className="size-4 text-green-600" aria-hidden="true" />
          <span className="text-sm">!PDF נוצר בהצלחה</span>
        </>
      )}
      {state === 'error' && (
        <>
          <AlertCircle className="size-4 text-destructive" aria-hidden="true" />
          <span className="text-sm">שגיאה ביצירת PDF. נסה שוב.</span>
          <button
            type="button"
            onClick={onRetry}
            className="rounded border border-border px-2 py-0.5 text-xs hover:bg-muted transition-colors"
            aria-label="נסה שוב"
          >
            נסה שוב
          </button>
          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="rounded border border-border px-2 py-0.5 text-xs hover:bg-muted transition-colors"
              aria-label="הדפס"
            >
              הדפס
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label="סגור"
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}
