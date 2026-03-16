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
import { Button } from '@/components/ui/button';
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
  }

  const ext = EXT_MAP[exportType];
  const title = TITLE_MAP[exportType];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="max-w-[480px] gap-0 bg-surface p-0 shadow-[var(--shadow-4)]"
      >
        <DialogHeader className="px-6 pt-5 pb-3">
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          <DialogDescription>הכנס שם קובץ לייצוא המסמך</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 px-6 pb-5">
          <input
            ref={inputRef}
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            onKeyDown={handleKeyDown}
            dir="auto"
            placeholder="שם הקובץ"
            aria-label="שם הקובץ לייצוא"
            className="flex-1 h-10 rounded-md bg-background border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-faint focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-[var(--ring)] transition-colors"
          />
          <span
            className="flex-shrink-0 text-sm text-foreground-muted"
            aria-label={`סיומת הקובץ: ${ext}`}
          >
            {ext}
          </span>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            aria-label="ביטול ייצוא"
          >
            ביטול
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={!filename.trim()}
            aria-label="אשר ייצוא"
          >
            ייצא
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
