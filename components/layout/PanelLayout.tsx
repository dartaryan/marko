'use client';
import type { ViewMode } from '@/types/editor';

interface PanelLayoutProps {
  editorPanel: React.ReactNode;
  previewPanel: React.ReactNode;
  viewMode: ViewMode;
}

export function PanelLayout({ editorPanel, previewPanel, viewMode }: PanelLayoutProps) {
  const gridTemplateColumns =
    viewMode === 'split'   ? '1fr 1fr' :
    viewMode === 'editor'  ? '1fr 0fr' :
                             '0fr 1fr';

  // Respect prefers-reduced-motion — check happens client-side only.
  // SSR: always render with transition (no window access). Minor hydration mismatch is acceptable.
  const transition =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'none'
      : 'grid-template-columns 200ms ease-in-out';

  return (
    <div
      className="marko-panel-grid grid h-[calc(100vh-var(--header-height,3.5rem))] overflow-hidden bg-background-subtle p-2 gap-3 md:p-3 md:gap-4 lg:p-4 lg:gap-6"
      style={{ gridTemplateColumns, transition }}
      aria-label="פאנל עורך ותצוגה מקדימה"
      suppressHydrationWarning
    >
      <div
        className="marko-panel flex flex-col overflow-hidden min-w-0 bg-surface"
        aria-hidden={viewMode === 'preview' || undefined}
        inert={viewMode === 'preview'}
        suppressHydrationWarning
      >
        {editorPanel}
      </div>
      <div
        className="marko-panel flex flex-col overflow-hidden min-w-0 bg-surface"
        aria-hidden={viewMode === 'editor' || undefined}
        inert={viewMode === 'editor'}
        suppressHydrationWarning
      >
        {previewPanel}
      </div>
    </div>
  );
}
