'use client';
import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { renderMarkdown } from '@/lib/markdown/render-pipeline';
import { initializeMermaid, runMermaid } from '@/lib/markdown/mermaid-setup';
import 'highlight.js/styles/github-dark.css';
import type { DocDirection } from '@/types/editor';

interface MarkdownRendererProps {
  content: string;
  dir?: DocDirection;
}

/** Detect presence of mermaid blocks in rendered HTML without full DOM parse */
export function hasMermaidContent(html: string): boolean {
  return html.includes('class="mermaid"');
}

// Placeholder shown when content is empty — rendered via dangerouslySetInnerHTML
// so we always use a single div root, avoiding server/client structural mismatch.
const EMPTY_PLACEHOLDER =
  '<div class="flex h-full items-center justify-center text-muted-foreground">' +
  '<p class="text-sm">...הדבק מארקדאון בעורך כדי לראות תצוגה מקדימה</p>' +
  '</div>';

export const MarkdownRenderer = React.forwardRef<HTMLDivElement, MarkdownRendererProps>(
  function MarkdownRenderer({ content, dir = 'rtl' }, forwardedRef) {
    const containerRef = useRef<HTMLDivElement>(null);

    const html = useMemo(
      () => DOMPurify.sanitize(renderMarkdown(content)),
      [content]
    );

    const renderMermaidDiagrams = useCallback(async () => {
      if (!containerRef.current || !hasMermaidContent(html)) return;

      const mermaidDivs = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>('.mermaid')
      );
      if (mermaidDivs.length === 0) return;

      // textContent gives decoded text (browser auto-decodes HTML entities)
      mermaidDivs.forEach((div) => {
        const source = div.textContent ?? '';
        div.textContent = source;
      });

      await initializeMermaid();

      await Promise.allSettled(
        mermaidDivs.map(async (div) => {
          const originalSource = div.textContent ?? '';  // Save before Mermaid mutates the div
          try {
            await runMermaid([div]);
            // Check for error SVG produced by Mermaid on invalid syntax
            if (!div.querySelector('svg') || div.querySelector('.error-icon')) {
              throw new Error('Mermaid render error');
            }
          } catch {
            const wrapper = div.closest('.mermaid-wrapper') ?? div;
            wrapper.innerHTML = `
              <div class="mermaid-error" role="alert" aria-label="שגיאה בתרשים">
                <p class="mermaid-error-title">שגיאה בתרשים</p>
                <pre class="mermaid-error-source">${originalSource.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
              </div>`;
          }
        })
      );
    }, [html]);

    useEffect(() => {
      renderMermaidDiagrams();
    }, [renderMermaidDiagrams]);

    // Single root element with suppressHydrationWarning:
    // The content prop comes from localStorage (client-only), so the server renders
    // empty content while the client renders the stored markdown. suppressHydrationWarning
    // prevents React from warning about this intentional server/client divergence.
    return (
      <div
        ref={(node) => {
          (containerRef as { current: HTMLDivElement | null }).current = node;
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else if (forwardedRef) {
            (forwardedRef as { current: HTMLDivElement | null }).current = node;
          }
        }}
        dir={dir}
        suppressHydrationWarning
        className={html ? 'preview-content h-full overflow-y-auto p-6' : 'h-full'}
        dangerouslySetInnerHTML={{ __html: html || EMPTY_PLACEHOLDER }}
        aria-label={html ? 'תצוגה מקדימה של המסמך המעובד' : undefined}
        aria-live={html ? 'polite' : undefined}
        aria-atomic={html ? 'false' : undefined}
      />
    );
  }
);
MarkdownRenderer.displayName = 'MarkdownRenderer';
