'use client';
import { type RefObject, useRef } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  ListChecks,
  Link,
  ImageIcon,
  Table2,
  Minus,
  Sparkles,
} from 'lucide-react';
import { FormatButton } from './FormatButton';
import { ToolbarDropdown, type DropdownItem } from './ToolbarDropdown';
import { getFormatText, type FormatType } from '@/lib/editor/format-utils';
import { MERMAID_TEMPLATES, getMermaidTemplate } from '@/lib/markdown/mermaid-templates';

interface EditorToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onInsert: (text: string) => void;
  onAiClick?: () => void;
}

function ToolbarSeparator() {
  return <div className="mx-0.5 h-4 w-px bg-border" aria-hidden="true" />;
}

export function EditorToolbar({ textareaRef, onInsert, onAiClick }: EditorToolbarProps) {
  // Stores textarea selection at the moment a dropdown trigger is clicked,
  // before the textarea loses focus and the selection may be cleared visually.
  const savedSelRef = useRef<string>('');

  function getSelected(): string {
    const ta = textareaRef.current;
    if (!ta) return '';
    return ta.value.slice(ta.selectionStart, ta.selectionEnd);
  }

  function insert(type: FormatType) {
    onInsert(getFormatText(type, getSelected()));
  }

  // AC3: ARIA toolbar composite widget — ArrowLeft/Right navigate between toolbar items.
  // Tab moves focus out of the toolbar (default browser behaviour, no override needed).
  function handleToolbarKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
    const active = document.activeElement as HTMLElement;
    // When focus is inside an open dropdown menu, let ToolbarDropdown handle arrow keys.
    if (active?.getAttribute('role') === 'menuitem') return;
    const focusable = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>('button:not([role="menuitem"])')
    );
    if (focusable.length === 0) return;
    const idx = focusable.indexOf(active);
    if (idx === -1) return;
    e.preventDefault();
    const next =
      e.key === 'ArrowRight' ? (idx + 1) % focusable.length
      : e.key === 'ArrowLeft' ? (idx - 1 + focusable.length) % focusable.length
      : e.key === 'Home' ? 0
      : focusable.length - 1;
    focusable[next]?.focus();
  }

  const headingItems: DropdownItem[] = [
    { label: 'כותרת 1', labelEn: 'H1', value: 'h1' },
    { label: 'כותרת 2', labelEn: 'H2', value: 'h2' },
    { label: 'כותרת 3', labelEn: 'H3', value: 'h3' },
    { label: 'כותרת 4', labelEn: 'H4', value: 'h4' },
    { label: 'כותרת 5', labelEn: 'H5', value: 'h5' },
    { label: 'כותרת 6', labelEn: 'H6', value: 'h6' },
  ];

  const codeItems: DropdownItem[] = [
    { label: 'קוד מוטבע', labelEn: 'Inline', value: 'code-inline' },
    { label: 'בלוק קוד', labelEn: 'Block', value: 'code-block' },
  ];

  const mermaidItems: DropdownItem[] = MERMAID_TEMPLATES.map((t) => ({
    label: t.labelHe,
    labelEn: t.labelEn,
    value: t.key,
  }));

  return (
    <div
      role="toolbar"
      aria-label="סרגל עיצוב"
      className="marko-toolbar flex flex-wrap items-center gap-0.5 border-b border-border"
      onKeyDown={handleToolbarKeyDown}
    >
      {/* Group 1: Text formatting */}
      <FormatButton onClick={() => insert('bold')} ariaLabel="מודגש" title="מודגש">
        <Bold className="size-3.5" />
      </FormatButton>
      <FormatButton onClick={() => insert('italic')} ariaLabel="נטוי" title="נטוי">
        <Italic className="size-3.5" />
      </FormatButton>
      <FormatButton onClick={() => insert('strikethrough')} ariaLabel="קו חוצה" title="קו חוצה">
        <Strikethrough className="size-3.5" />
      </FormatButton>

      <ToolbarSeparator />

      {/* Group 2: Headings dropdown */}
      <ToolbarDropdown
        triggerAriaLabel="כותרת"
        triggerLabel="כותרת"
        items={headingItems}
        onBeforeOpen={() => { savedSelRef.current = getSelected(); }}
        onSelect={(val) => onInsert(getFormatText(val as FormatType, savedSelRef.current))}
      />

      <ToolbarSeparator />

      {/* Group 3: Lists */}
      <FormatButton onClick={() => insert('ul')} ariaLabel="רשימה" title="רשימה">
        <List className="size-3.5" />
      </FormatButton>
      <FormatButton onClick={() => insert('ol')} ariaLabel="רשימה ממוספרת" title="רשימה ממוספרת">
        <ListOrdered className="size-3.5" />
      </FormatButton>
      <FormatButton onClick={() => insert('task')} ariaLabel="רשימת משימות" title="רשימת משימות">
        <ListChecks className="size-3.5" />
      </FormatButton>

      <ToolbarSeparator />

      {/* Group 4: Insert */}
      <FormatButton onClick={() => insert('link')} ariaLabel="קישור" title="קישור">
        <Link className="size-3.5" />
      </FormatButton>
      <FormatButton onClick={() => insert('image')} ariaLabel="תמונה" title="תמונה">
        <ImageIcon className="size-3.5" />
      </FormatButton>
      <FormatButton onClick={() => insert('table')} ariaLabel="טבלה" title="טבלה">
        <Table2 className="size-3.5" />
      </FormatButton>
      <FormatButton onClick={() => insert('hr')} ariaLabel="קו מפריד" title="קו מפריד">
        <Minus className="size-3.5" />
      </FormatButton>

      <ToolbarSeparator />

      {/* Group 5: Code dropdown */}
      <ToolbarDropdown
        triggerAriaLabel="קוד"
        triggerLabel="קוד"
        items={codeItems}
        onBeforeOpen={() => { savedSelRef.current = getSelected(); }}
        onSelect={(val) => onInsert(getFormatText(val as FormatType, savedSelRef.current))}
      />

      <ToolbarSeparator />

      {/* Group 6: Mermaid dropdown */}
      <ToolbarDropdown
        triggerAriaLabel="הוסף תרשים Mermaid"
        triggerLabel="תרשים"
        items={mermaidItems}
        onSelect={(key) => onInsert(getMermaidTemplate(key))}
      />

      <ToolbarSeparator />

      {/* Group 7: AI */}
      <FormatButton
        onClick={() => onAiClick?.()}
        ariaLabel="שאל את מארקו AI (Ctrl+K)"
        title="שאל את מארקו AI (Ctrl+K)"
      >
        <Sparkles className="size-3.5 text-green-500" />
      </FormatButton>
    </div>
  );
}
