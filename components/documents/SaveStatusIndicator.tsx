'use client';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SaveStatus } from '@/lib/hooks/useSaveStatus';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
}

export function SaveStatusIndicator({ status }: SaveStatusIndicatorProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="marko-header-zone marko-header-zone--save-status"
    >
      <span
        className={cn(
          'text-xs transition-opacity duration-500',
          status === 'idle' && 'opacity-0',
          status === 'saving' && 'text-muted-foreground opacity-100 motion-safe:animate-pulse',
          status === 'saved' && 'text-muted-foreground opacity-100',
          status === 'error' && 'text-destructive opacity-100',
        )}
      >
        {status === 'saving' && 'שומר...'}
        {status === 'saved' && (
          <>
            <Check className="inline size-3 me-1" aria-hidden="true" />
            נשמר
          </>
        )}
        {status === 'error' && 'שגיאה בשמירה'}
      </span>
    </div>
  );
}
