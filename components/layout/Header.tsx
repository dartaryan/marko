'use client';
import { Expand, Trash2, FileText, Palette } from 'lucide-react';
import { ViewModeToggle } from './ViewModeToggle';
import { DirectionToggle } from './DirectionToggle';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ToolbarDropdown } from '@/components/editor/ToolbarDropdown';
import type { ViewMode, DocDirection, ExportType } from '@/types/editor';

const exportItems = [
  { label: 'PDF', value: 'pdf' },
  { label: 'HTML', value: 'html' },
  { label: 'Markdown', labelEn: '.md', value: 'markdown' },
];

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onEnterPresentation: () => void;
  docDirection: DocDirection;
  onDirectionChange: (dir: DocDirection) => void;
  onClearEditor: () => void;
  onLoadSample: () => void;
  onOpenColorPanel?: () => void;
  onExportRequest: (type: ExportType) => void;
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
  onExportRequest,
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
        <ToolbarDropdown
          triggerLabel="ייצא"
          triggerAriaLabel="ייצא מסמך"
          items={exportItems}
          onSelect={(val) => onExportRequest(val as ExportType)}
        />
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
        <ThemeToggle />
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
