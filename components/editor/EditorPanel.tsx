'use client';
import { EditorTextarea } from './EditorTextarea';

interface EditorPanelProps {
  content: string;
  onChange: (content: string) => void;
}

export function EditorPanel({ content, onChange }: EditorPanelProps) {
  return (
    <section
      className="flex flex-col border-e border-border"
      aria-label="עורך מארקדאון"
    >
      <div className="flex h-9 items-center border-b border-border px-4">
        <span className="text-sm font-medium text-muted-foreground">עורך</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <EditorTextarea value={content} onChange={onChange} />
      </div>
    </section>
  );
}
