'use client';
import { Bold, Italic, Heading1, Link, List } from 'lucide-react';
import { getFormatText } from '@/lib/editor/format-utils';
import type { ViewMode } from '@/types/editor';

interface MobileBottomToolbarProps {
  viewMode: ViewMode;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onContentChange: (content: string) => void;
}

export function MobileBottomToolbar({ viewMode, textareaRef, onContentChange }: MobileBottomToolbarProps) {
  if (viewMode === 'preview') return null;

  function insert(type: Parameters<typeof getFormatText>[0]) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const selected = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
    const text = getFormatText(type, selected);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = textarea.value.slice(0, start) + text + textarea.value.slice(end);
    onContentChange(newContent);
    const newCursor = start + text.length;
    setTimeout(() => {
      textarea.setSelectionRange(newCursor, newCursor);
      textarea.focus();
    }, 0);
  }

  return (
    <div className="marko-mobile-bottom-toolbar" role="toolbar" aria-label="סרגל עיצוב מהיר">
      <button
        type="button"
        onPointerDown={(e) => e.preventDefault()}
        onClick={() => insert('bold')}
        aria-label="מודגש"
        title="מודגש"
        className="marko-header-btn"
      >
        <Bold className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onPointerDown={(e) => e.preventDefault()}
        onClick={() => insert('italic')}
        aria-label="נטוי"
        title="נטוי"
        className="marko-header-btn"
      >
        <Italic className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onPointerDown={(e) => e.preventDefault()}
        onClick={() => insert('h1')}
        aria-label="כותרת"
        title="כותרת"
        className="marko-header-btn"
      >
        <Heading1 className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onPointerDown={(e) => e.preventDefault()}
        onClick={() => insert('link')}
        aria-label="קישור"
        title="קישור"
        className="marko-header-btn"
      >
        <Link className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onPointerDown={(e) => e.preventDefault()}
        onClick={() => insert('ul')}
        aria-label="רשימה"
        title="רשימה"
        className="marko-header-btn"
      >
        <List className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
