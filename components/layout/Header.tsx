'use client';
import { Expand, Trash2, FileText, Palette } from 'lucide-react';
import { ViewModeToggle } from './ViewModeToggle';
import { DirectionToggle } from './DirectionToggle';
import type { ViewMode, DocDirection } from '@/types/editor';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onEnterPresentation: () => void;
  docDirection: DocDirection;
  onDirectionChange: (dir: DocDirection) => void;
  onClearEditor: () => void;
  onLoadSample: () => void;
  onOpenColorPanel?: () => void;
}

export function Header({
  viewMode,
  onViewModeChange,
  onEnterPresentation,
  docDirection,
  onDirectionChange,
  onClearEditor,
  onLoadSample,
  onOpenColorPanel,
}: HeaderProps) {
  return (
    <header
      className="flex h-14 items-center justify-between border-b border-border px-4"
      aria-label="סרגל כלים של מארקו"
    >
      {/* Logo — start */}
      <h1 className="text-base font-semibold" style={{ color: 'var(--color-h1)' }}>
        מארקו
      </h1>

      {/* View mode toggle — centre */}
      <ViewModeToggle value={viewMode} onChange={onViewModeChange} />

      {/* Utility buttons — end group */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenColorPanel}
          disabled={!onOpenColorPanel}
          aria-label="הגדרות צבע"
          title="הגדרות צבע"
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground
                     hover:bg-muted hover:text-foreground active:scale-[0.97] transition-colors
                     disabled:opacity-50 disabled:pointer-events-none"
        >
          <Palette className="size-4" aria-hidden="true" />
        </button>
        <DirectionToggle value={docDirection} onChange={onDirectionChange} />
        <button
          type="button"
          onClick={onLoadSample}
          aria-label="טען מסמך לדוגמה"
          title="טען מסמך לדוגמה"
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground
                     hover:bg-muted hover:text-foreground active:scale-[0.97] transition-colors"
        >
          <FileText className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onClearEditor}
          aria-label="נקה עורך"
          title="נקה עורך"
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground
                     hover:bg-destructive/10 hover:text-destructive active:scale-[0.97] transition-colors"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onEnterPresentation}
          aria-label="מצב מצגת"
          title="מצב מצגת"
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground
                     hover:bg-muted hover:text-foreground active:scale-[0.97] transition-colors"
        >
          <Expand className="size-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
