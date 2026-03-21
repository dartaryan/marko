'use client';
import { Expand, Trash2, FileText, Palette, Copy, FileDown, ClipboardCopy, Clipboard, Code, FileType } from 'lucide-react';
import { ViewModeToggle } from './ViewModeToggle';
import { DirectionToggle } from './DirectionToggle';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ToolbarDropdown } from '@/components/editor/ToolbarDropdown';
import { AuthGate } from '@/components/auth/AuthGate';
import type { ViewMode, DocDirection, ExportType, CopyType } from '@/types/editor';

const copyItems = [
  { label: 'Word', value: 'word', icon: <ClipboardCopy className="size-5" aria-hidden="true" /> },
  { label: 'HTML', value: 'html', icon: <Clipboard className="size-5" aria-hidden="true" /> },
  { label: 'טקסט', value: 'text', icon: <Clipboard className="size-5" aria-hidden="true" /> },
];

const exportItems = [
  { label: 'PDF', value: 'pdf', icon: <FileDown className="size-5" aria-hidden="true" /> },
  { label: 'HTML', value: 'html', icon: <Code className="size-5" aria-hidden="true" /> },
  { label: 'Markdown', labelEn: '.md', value: 'markdown', icon: <FileType className="size-5" aria-hidden="true" /> },
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
          triggerIcon={<Copy className="size-5" aria-hidden="true" />}
          triggerAriaLabel="העתק תוכן ללוח"
          items={copyItems}
          onSelect={(val) => onCopyRequest(val as CopyType)}
        />
        <ToolbarDropdown
          triggerLabel="ייצא"
          triggerIcon={<FileDown className="size-5" aria-hidden="true" />}
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
          className="flex h-11 items-center justify-center gap-1.5 rounded-md px-3 text-[#a7f3d0]
                     hover:bg-[rgba(110,231,183,0.2)] hover:text-white active:scale-[0.97] transition-colors
                     disabled:opacity-50 disabled:pointer-events-none"
        >
          <Palette className="size-5" aria-hidden="true" />
          <span className="hidden md:inline text-sm">צבעים</span>
        </button>
        <ThemeToggle />
        <DirectionToggle value={docDirection} onChange={onDirectionChange} />
        <button
          type="button"
          onClick={onLoadSample}
          aria-label="טען מסמך לדוגמה"
          title="טען מסמך לדוגמה"
          className="flex h-11 items-center justify-center gap-1.5 rounded-md px-3 text-[#a7f3d0]
                     hover:bg-[rgba(110,231,183,0.2)] hover:text-white active:scale-[0.97] transition-colors"
        >
          <FileText className="size-5" aria-hidden="true" />
          <span className="hidden md:inline text-sm">מסמך לדוגמה</span>
        </button>
        <button
          type="button"
          onClick={onClearEditor}
          aria-label="נקה עורך"
          title="נקה עורך"
          className="flex h-11 items-center justify-center gap-1.5 rounded-md px-3 text-[#a7f3d0]
                     hover:bg-[rgba(239,68,68,0.15)] hover:text-[#F87171] active:scale-[0.97] transition-colors"
        >
          <Trash2 className="size-5" aria-hidden="true" />
          <span className="hidden md:inline text-sm">נקה</span>
        </button>
        <button
          type="button"
          onClick={onEnterPresentation}
          aria-label="מצב מצגת"
          title="מצב מצגת"
          className="flex h-11 items-center justify-center gap-1.5 rounded-md px-3 text-[#a7f3d0]
                     hover:bg-[rgba(110,231,183,0.2)] hover:text-white active:scale-[0.97] transition-colors"
        >
          <Expand className="size-5" aria-hidden="true" />
          <span className="hidden md:inline text-sm">מצגת</span>
        </button>

        <div className="mx-1 h-6 w-px bg-[rgba(255,255,255,0.15)]" aria-hidden="true" />
        <AuthGate />
      </div>
    </header>
  );
}
