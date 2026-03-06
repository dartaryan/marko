'use client';
import { forwardRef } from 'react';

interface EditorTextareaProps {
  value: string;
  onChange: (value: string) => void;
}

export const EditorTextarea = forwardRef<HTMLTextAreaElement, EditorTextareaProps>(
  function EditorTextarea({ value, onChange }, ref) {
    return (
      <textarea
        ref={ref}
        className="h-full w-full resize-none bg-background p-4 font-mono text-sm text-foreground
                   placeholder:text-muted-foreground focus:outline-none"
        dir="rtl"
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
