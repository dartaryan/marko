'use client';
import { forwardRef } from 'react';
import type { DocDirection } from '@/types/editor';

interface EditorTextareaProps {
  value: string;
  onChange: (value: string) => void;
  dir?: DocDirection;
}

export const EditorTextarea = forwardRef<HTMLTextAreaElement, EditorTextareaProps>(
  function EditorTextarea({ value, onChange, dir = 'rtl' }, ref) {
    return (
      <textarea
        ref={ref}
        className="h-full w-full resize-none bg-surface p-4 font-mono text-sm text-foreground
                   placeholder:text-muted-foreground focus:outline-none"
        dir={dir}
        lang="he"
        aria-label="תוכן מארקדאון לעריכה"
        aria-multiline="true"
        placeholder="...הדבק טקסט מארקדאון כאן"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        suppressHydrationWarning
      />
    );
  }
);
