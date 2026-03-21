'use client';
import { Palette, Copy, FileDown, ClipboardCopy, Clipboard, Code, FileType, Sparkles, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { ViewModeToggle } from './ViewModeToggle';
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

function ZoneSeparator() {
  return <div className="marko-header-separator" aria-hidden="true" />;
}

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
  onAiClick?: () => void;
}

export function Header({
  viewMode,
  onViewModeChange,
  onOpenColorPanel,
  onExportRequest,
  onCopyRequest,
  onAiClick,
}: HeaderProps) {
  return (
    <header
      className="marko-header flex h-16 items-center"
      aria-label="סרגל כלים של מארקו"
    >
      <div className="marko-header-zones">
        {/* Zone 1: Brand */}
        <div className="marko-header-zone">
          <Link href="/" className="flex items-center gap-2 text-[18px] font-bold text-[#10B981]">
            <span className="marko-logo-icon flex h-8 w-8 items-center justify-center text-[13px] font-bold text-emerald-900">מ</span>
            מארקו
          </Link>
        </div>

        <ZoneSeparator />

        {/* Zone 2: View Modes */}
        <div className="marko-header-zone">
          <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
        </div>

        <ZoneSeparator />

        {/* Zone 3: AI Star Button */}
        <div className="marko-header-zone">
          <button
            type="button"
            onClick={onAiClick}
            aria-label="עוזר AI (Ctrl+J)"
            title="עוזר AI (Ctrl+J)"
            className="marko-header-btn marko-header-btn--ai"
          >
            <Sparkles className="size-5" aria-hidden="true" />
            <span>עוזר AI</span>
          </button>
        </div>

        <ZoneSeparator />

        {/* Zone 4: Output (Export + Copy) */}
        <div className="marko-header-zone">
          <ToolbarDropdown
            triggerLabel="ייצוא"
            triggerIcon={<FileDown className="size-5" aria-hidden="true" />}
            triggerAriaLabel="ייצא מסמך"
            items={exportItems}
            onSelect={(val) => onExportRequest(val as ExportType)}
          />
          <ToolbarDropdown
            triggerLabel="העתק"
            triggerIcon={<Copy className="size-5" aria-hidden="true" />}
            triggerAriaLabel="העתק תוכן ללוח"
            items={copyItems}
            onSelect={(val) => onCopyRequest(val as CopyType)}
          />
        </div>

        <ZoneSeparator />

        {/* Zone 5: Tools (Color panel + Theme toggle) */}
        <div className="marko-header-zone">
          <button
            type="button"
            onClick={onOpenColorPanel}
            disabled={!onOpenColorPanel}
            aria-label="הגדרות צבע"
            title="הגדרות צבע"
            className="marko-header-btn disabled:opacity-50 disabled:pointer-events-none"
          >
            <Palette className="size-5" aria-hidden="true" />
          </button>
          <ThemeToggle />
        </div>

        <ZoneSeparator />

        {/* Zone 6: Overflow (placeholder — dropdown in Story 12.3) */}
        <div className="marko-header-zone">
          <button
            type="button"
            aria-label="תפריט נוסף"
            title="תפריט נוסף"
            className="marko-header-btn"
          >
            <MoreHorizontal className="size-5" aria-hidden="true" />
          </button>
        </div>

        <ZoneSeparator />

        {/* Zone 7: User */}
        <div className="marko-header-zone">
          <AuthGate />
        </div>
      </div>
    </header>
  );
}
