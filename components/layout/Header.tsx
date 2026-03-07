'use client';
import { Expand } from 'lucide-react';
import { ViewModeToggle } from './ViewModeToggle';
import type { ViewMode } from '@/types/editor';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onEnterPresentation: () => void;
}

export function Header({ viewMode, onViewModeChange, onEnterPresentation }: HeaderProps) {
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

      {/* Presentation mode button — end */}
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
    </header>
  );
}
