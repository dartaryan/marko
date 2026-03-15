'use client';
import { Expand, Trash2, FileText, Palette } from 'lucide-react';
import { ViewModeToggle } from './ViewModeToggle';
import { DirectionToggle } from './DirectionToggle';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ToolbarDropdown } from '@/components/editor/ToolbarDropdown';
import { AuthGate } from '@/components/auth/AuthGate';
import type { ViewMode, DocDirection, ExportType, CopyType } from '@/types/editor';

const copyItems = [
  { label: 'Word', value: 'word' },
  { label: 'HTML', value: 'html' },
  { label: 'טקסט', value: 'text' },
];

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
  onCopyRequest: (type: CopyType) => void;
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
  onCopyRequest,
}: HeaderProps) {
  return (
    <header
      className="marko-header flex h-14 items-center justify-between px-4"
      aria-label="סרגל כלים של מארקו"
    >
      <h1 className="flex items-center gap-2 text-[18px] font-bold text-[#10B981]">
        <span className="marko-logo-icon flex h-6 w-6 items-center justify-center text-[11px] font-bold text-emerald-900">מ</span>
        מארקו
      </h1>

      <ViewModeToggle value={viewMode} onChange={onViewModeChange} />

      <div className="flex items-center gap-1">
        <ToolbarDropdown
          triggerLabel="העתק"
          triggerAriaLabel="העתק תוכן ללוח"
          items={copyItems}
          onSelect={(val) => onCopyRequest(val as CopyType)}
        />
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
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#a7f3d0]
                     hover:bg-[rgba(110,231,183,0.2)] hover:text-white active:scale-[0.97] transition-colors
                     disabled:opacity-50 disabled:pointer-events-none"
        >
          <Palette className="size-5" aria-hidden="true" />
        </button>
        <ThemeToggle />
        <DirectionToggle value={docDirection} onChange={onDirectionChange} />
        <button
          type="button"
          onClick={onLoadSample}
          aria-label="טען מסמך לדוגמה"
          title="טען מסמך לדוגמה"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#a7f3d0]
                     hover:bg-[rgba(110,231,183,0.2)] hover:text-white active:scale-[0.97] transition-colors"
        >
          <FileText className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onClearEditor}
          aria-label="נקה עורך"
          title="נקה עורך"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#a7f3d0]
                     hover:bg-[rgba(239,68,68,0.15)] hover:text-[#F87171] active:scale-[0.97] transition-colors"
        >
          <Trash2 className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onEnterPresentation}
          aria-label="מצב מצגת"
          title="מצב מצגת"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#a7f3d0]
                     hover:bg-[rgba(110,231,183,0.2)] hover:text-white active:scale-[0.97] transition-colors"
        >
          <Expand className="size-5" aria-hidden="true" />
        </button>

        <div className="mx-1 h-6 w-px bg-[rgba(255,255,255,0.15)]" aria-hidden="true" />
        <AuthGate />
      </div>
    </header>
  );
}
