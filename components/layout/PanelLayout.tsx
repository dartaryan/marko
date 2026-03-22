'use client';
import { ViewModeToggle } from './ViewModeToggle';
import type { ViewMode } from '@/types/editor';

interface PanelLayoutProps {
  editorPanel: React.ReactNode;
  previewPanel: React.ReactNode;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  hasBottomToolbar?: boolean;
}

export function PanelLayout({ editorPanel, previewPanel, viewMode, onViewModeChange, hasBottomToolbar }: PanelLayoutProps) {
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

  const gridClassName = [
    'marko-panel-grid grid overflow-hidden p-2 gap-2 md:p-4 md:gap-4 lg:p-6 lg:gap-6',
    hasBottomToolbar ? 'marko-panel-grid--has-bottom-toolbar' : '',
  ].join(' ');

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem))] overflow-hidden">
      {/* Mobile view toggle — shown ≤1023px via CSS */}
      <div className="marko-mobile-view-toggle">
        <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
      </div>

      <div
        className={gridClassName}
        style={{ gridTemplateColumns, transition, height: '100%' }}
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
    </div>
  );
}
