'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { getFirstHeading } from '@/lib/export/filename-utils';
import type { ExportType } from '@/types/editor';

const EXT_MAP: Record<ExportType, string> = {
  pdf: '.pdf',
  html: '.html',
  markdown: '.md',
};

const TITLE_MAP: Record<ExportType, string> = {
  pdf: 'ייצא PDF',
  html: 'ייצא HTML',
  markdown: 'ייצא Markdown',
};

interface ExportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  exportType: ExportType;
  content: string;
  onExport: (filename: string, type: ExportType) => void;
}

export function ExportModal({
  isOpen,
  onOpenChange,
  exportType,
  content,
  onExport,
}: ExportModalProps) {
  const [filename, setFilename] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef(content);
  contentRef.current = content;

  // Reset filename to first heading when modal opens (snapshot content at open time only —
  // excluding 'content' from deps intentionally: adding it would reset user edits on every keystroke)
  useEffect(() => {
    if (isOpen) {
      setFilename(getFirstHeading(contentRef.current));
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus and select-all input when modal opens (no autoFocus — Story 2.3 review)
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  function handleExport() {
    const trimmed = filename.trim();
    if (!trimmed) return;
    try {
      onExport(trimmed, exportType);
    } finally {
      onOpenChange(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleExport();
    // Escape handled natively by Radix UI Dialog
  }

  const ext = EXT_MAP[exportType];
  const title = TITLE_MAP[exportType];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>הכנס שם קובץ לייצוא המסמך</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            onKeyDown={handleKeyDown}
            dir="auto"
            placeholder="שם הקובץ"
            aria-label="שם הקובץ לייצוא"
            className="flex-1 rounded border border-border px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span
            className="flex-shrink-0 text-sm text-muted-foreground"
            aria-label={`סיומת הקובץ: ${ext}`}
          >
            {ext}
          </span>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
            aria-label="ביטול ייצוא"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!filename.trim()}
            className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="אשר ייצוא"
          >
            ייצא
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
