'use client';
import { useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { renderMarkdown } from '@/lib/markdown/render-pipeline';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = useMemo(() => DOMPurify.sanitize(renderMarkdown(content)), [content]);

  if (!html) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">...הדבק מארקדאון בעורך כדי לראות תצוגה מקדימה</p>
      </div>
    );
  }

  return (
    <div
      className="preview-content h-full overflow-y-auto p-6"
      dangerouslySetInnerHTML={{ __html: html }}
      aria-label="תצוגה מקדימה של המסמך המעובד"
      aria-live="polite"
      aria-atomic="false"
    />
  );
}
