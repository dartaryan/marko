'use client';

interface EditorTextareaProps {
  value: string;
  onChange: (value: string) => void;
}

export function EditorTextarea({ value, onChange }: EditorTextareaProps) {
  return (
    <textarea
      className="h-full w-full resize-none bg-background p-4 font-mono text-sm text-foreground
                 placeholder:text-muted-foreground focus:outline-none"
      dir="rtl"
      lang="he"
      aria-label="תוכן מארקדאון לעריכה"
      placeholder="...הדבק טקסט מארקדאון כאן"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      suppressHydrationWarning
    />
  );
}
