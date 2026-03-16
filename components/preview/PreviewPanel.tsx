'use client';
import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { DocDirection } from '@/types/editor';

interface PreviewPanelProps {
  content: string;
  dir?: DocDirection;
  contentRef?: React.Ref<HTMLDivElement>;
}

export function PreviewPanel({ content, dir = 'rtl', contentRef }: PreviewPanelProps) {
  return (
    <section
      className="flex flex-col flex-1 min-h-0"
      aria-label="תצוגה מקדימה"
    >
      <div className="flex items-center border-b border-border-subtle" style={{ padding: '12px 16px' }}>
        <span style={{ fontSize: 'var(--text-caption)', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>תצוגה מקדימה</span>
      </div>
      <div
        className="flex-1 overflow-hidden"
        style={{ backgroundColor: 'var(--color-preview-bg)' }}
      >
        <MarkdownRenderer ref={contentRef} content={content} dir={dir} />
      </div>
    </section>
  );
}
