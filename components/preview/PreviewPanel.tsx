'use client';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { DocDirection } from '@/types/editor';

interface PreviewPanelProps {
  content: string;
  dir?: DocDirection;
}

export function PreviewPanel({ content, dir = 'rtl' }: PreviewPanelProps) {
  return (
    <section
      className="flex flex-col flex-1 min-h-0"
      aria-label="תצוגה מקדימה"
    >
      <div className="flex h-9 items-center border-b border-border px-4">
        <span className="text-sm font-medium text-muted-foreground">תצוגה מקדימה</span>
      </div>
      <div
        className="flex-1 overflow-hidden"
        style={{ backgroundColor: 'var(--color-preview-bg)' }}
      >
        <MarkdownRenderer content={content} dir={dir} />
      </div>
    </section>
  );
}
