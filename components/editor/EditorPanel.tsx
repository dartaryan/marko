'use client';
import { useRef } from 'react';
import { EditorTextarea } from './EditorTextarea';
import { EditorToolbar } from './EditorToolbar';
import { SelectionToolbar } from './SelectionToolbar';
import type { DocDirection } from '@/types/editor';

interface EditorPanelProps {
  content: string;
  onChange: (content: string) => void;
  dir?: DocDirection;
  onSlashCommand?: (cursorTop: number, cursorLeft: number) => void;
  onSelectionAiClick?: (selectedText: string, rect: { top: number; left: number }) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function EditorPanel({ content, onChange, dir = 'rtl', onSlashCommand, onSelectionAiClick, textareaRef: externalRef }: EditorPanelProps) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef ?? internalRef;

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
      className="flex flex-col flex-1 min-h-0"
      aria-label="עורך מארקדאון"
    >
      <div className="flex items-center border-b border-border-subtle" style={{ padding: '12px 16px' }}>
        <span style={{ fontSize: 'var(--text-caption)', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>עורך</span>
      </div>
      <EditorToolbar textareaRef={textareaRef} onInsert={insertTextAtCursor} />
      <div className="flex-1 overflow-hidden relative">
        <EditorTextarea ref={textareaRef} value={content} onChange={onChange} dir={dir} onSlashCommand={onSlashCommand} />
        {onSelectionAiClick && (
          <SelectionToolbar textareaRef={textareaRef} onAiClick={onSelectionAiClick} />
        )}
      </div>
    </section>
  );
}
