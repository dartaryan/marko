'use client';
import { FileText, Plus } from 'lucide-react';

interface DocumentEmptyStateProps {
  onCreateDocument: () => void;
}

export function DocumentEmptyState({ onCreateDocument }: DocumentEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <FileText className="size-12 text-muted-foreground/50" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">אין מסמכים עדיין</p>
      <button
        type="button"
        onClick={onCreateDocument}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Plus className="size-4" aria-hidden="true" />
        מסמך חדש
      </button>
    </div>
  );
}
