'use client';
import { useRef } from 'react';
import { EditorTextarea } from './EditorTextarea';
import { EditorToolbar } from './EditorToolbar';
import type { DocDirection } from '@/types/editor';

interface EditorPanelProps {
  content: string;
  onChange: (content: string) => void;
  dir?: DocDirection;
}

export function EditorPanel({ content, onChange, dir = 'rtl' }: EditorPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertTextAtCursor(text: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(content + '\n' + text);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.slice(0, start) + text + content.slice(end);
    onChange(newContent);
    const newCursor = start + text.length;
    setTimeout(() => {
      textarea.setSelectionRange(newCursor, newCursor);
      textarea.focus();
    }, 0);
  }

  return (
    <section
      className="flex flex-col flex-1 min-h-0 border-e border-border"
      aria-label="עורך מארקדאון"
    >
      <div className="flex h-9 items-center border-b border-border px-4">
        <span className="text-sm font-medium text-muted-foreground">עורך</span>
      </div>
      <EditorToolbar textareaRef={textareaRef} onInsert={insertTextAtCursor} />
      <div className="flex-1 overflow-hidden">
        <EditorTextarea ref={textareaRef} value={content} onChange={onChange} dir={dir} />
      </div>
    </section>
  );
}
