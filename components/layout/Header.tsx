'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Palette, Copy, FileDown, ClipboardCopy, Clipboard, Code, FileType, Sparkles, ChevronDown, FileText } from 'lucide-react';
import Link from 'next/link';
import { ViewModeToggle } from './ViewModeToggle';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ToolbarDropdown } from '@/components/editor/ToolbarDropdown';
import { AuthGate } from '@/components/auth/AuthGate';
import { OverflowMenu } from './OverflowMenu';
import type { ViewMode, DocDirection, ExportType, CopyType } from '@/types/editor';
import type { SaveStatus } from '@/lib/hooks/useSaveStatus';
import { SaveStatusIndicator } from '@/components/documents/SaveStatusIndicator';

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

function ZoneSeparator({ className }: { className?: string }) {
  return <div className={`marko-header-separator ${className ?? ''}`} aria-hidden="true" />;
}

/* Unified output dropdown — combines Export + Copy at ≤1439px */
function UnifiedOutputDropdown({
  onExportRequest,
  onCopyRequest,
}: {
  onExportRequest: (type: ExportType) => void;
  onCopyRequest: (type: CopyType) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const first = containerRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    first?.focus();
  }, [isOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const menuItems = Array.from(containerRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
        const idx = menuItems.indexOf(document.activeElement as HTMLElement);
        const next = e.key === 'ArrowDown' ? (idx + 1) % menuItems.length : (idx - 1 + menuItems.length) % menuItems.length;
        menuItems[next]?.focus();
      }
    },
    [isOpen, close]
  );

  return (
    <div ref={containerRef} className="marko-header-output-unified relative" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="ייצוא והעתקה"
        title="ייצוא והעתקה"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="marko-header-btn"
      >
        <FileDown className="size-5" aria-hidden="true" />
        <ChevronDown className="size-3" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="ייצוא והעתקה"
          className="absolute start-0 top-full z-[var(--z-dropdown)] mt-1 min-w-[180px] rounded-[8px] border border-border bg-popover p-1 shadow-[var(--shadow-2)] animate-slide-down"
        >
          <div className="ps-3 pe-3 py-1 text-xs text-muted-foreground font-medium" aria-hidden="true">ייצוא</div>
          {exportItems.map((item) => (
            <button
              key={`export-${item.value}`}
              role="menuitem"
              type="button"
              tabIndex={-1}
              onClick={() => { onExportRequest(item.value as ExportType); close(); }}
              className="flex w-full items-center gap-2 rounded-[4px] ps-3 pe-3 py-2 text-start text-sm text-popover-foreground hover:bg-primary-ghost hover:text-primary transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          <div className="ms-2 me-2 my-1 h-px bg-border" aria-hidden="true" />
          <div className="ps-3 pe-3 py-1 text-xs text-muted-foreground font-medium" aria-hidden="true">העתקה</div>
          {copyItems.map((item) => (
            <button
              key={`copy-${item.value}`}
              role="menuitem"
              type="button"
              tabIndex={-1}
              onClick={() => { onCopyRequest(item.value as CopyType); close(); }}
              className="flex w-full items-center gap-2 rounded-[4px] ps-3 pe-3 py-2 text-start text-sm text-popover-foreground hover:bg-primary-ghost hover:text-primary transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
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
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  saveStatus?: SaveStatus;
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
  onAiClick,
  onToggleSidebar,
  isSidebarOpen,
  saveStatus,
}: HeaderProps) {
  return (
    <header
      className="marko-header flex h-16 items-center"
      aria-label="סרגל כלים של מארקו"
    >
      <div className="marko-header-zones">
        {/* Zone 1: Brand */}
        <div className="marko-header-zone marko-header-zone--brand">
          <Link href="/?home=true" className="flex items-center gap-2 text-[18px] font-bold text-[#10B981]">
            <span className="marko-logo-icon flex h-8 w-8 items-center justify-center text-[13px] font-bold text-emerald-900">מ</span>
            <span className="marko-header-brand-text">מארקו</span>
          </Link>
        </div>

        <ZoneSeparator className="marko-header-separator--after-brand" />

        {/* Zone 1.5: Document Sidebar Toggle */}
        {onToggleSidebar && (
          <div className="marko-header-zone marko-header-zone--documents">
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="רשימת מסמכים (Ctrl+\)"
              title="רשימת מסמכים (Ctrl+\)"
              aria-expanded={isSidebarOpen}
              className={`marko-header-btn ${isSidebarOpen ? 'marko-header-btn--active' : ''}`}
            >
              <FileText className="size-5" aria-hidden="true" />
            </button>
          </div>
        )}

        {onToggleSidebar && <ZoneSeparator className="marko-header-separator--after-documents" />}

        {/* Zone: Save Status */}
        {saveStatus !== undefined && <SaveStatusIndicator status={saveStatus} />}

        {/* Zone 2: View Modes */}
        <div className="marko-header-zone marko-header-zone--viewmodes">
          <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
        </div>

        <ZoneSeparator className="marko-header-separator--after-viewmodes" />

        {/* Zone 3: AI Star Button */}
        <div className="marko-header-zone marko-header-zone--ai">
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

        <ZoneSeparator className="marko-header-separator--after-ai" />

        {/* Zone 4: Output (Export + Copy) */}
        <div className="marko-header-zone marko-header-zone--output">
          {/* Individual dropdowns — visible ≥1440px */}
          <div className="marko-header-output-individual">
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
          {/* Unified dropdown — visible 768–1439px */}
          <UnifiedOutputDropdown
            onExportRequest={onExportRequest}
            onCopyRequest={onCopyRequest}
          />
        </div>

        <ZoneSeparator className="marko-header-separator--after-output" />

        {/* Zone 5: Tools (Color panel + Theme toggle) */}
        <div className="marko-header-zone marko-header-zone--tools">
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

        <ZoneSeparator className="marko-header-separator--after-tools" />

        {/* Zone 6: Overflow Menu (Story 12.3) */}
        <div className="marko-header-zone marko-header-zone--overflow">
          <OverflowMenu
            docDirection={docDirection}
            onDirectionChange={onDirectionChange}
            onLoadSample={onLoadSample}
            onClearEditor={onClearEditor}
            onEnterPresentation={onEnterPresentation}
          />
        </div>

        <ZoneSeparator className="marko-header-separator--after-overflow" />

        {/* Zone 7: User */}
        <div className="marko-header-zone marko-header-zone--user">
          <AuthGate
            docDirection={docDirection}
            onDirectionChange={onDirectionChange}
            onLoadSample={onLoadSample}
            onClearEditor={onClearEditor}
            onEnterPresentation={onEnterPresentation}
          />
        </div>
      </div>
    </header>
  );
}
