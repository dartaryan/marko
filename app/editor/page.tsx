'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { migrateV1Data } from '@/lib/migration/v1-migration';
import { useEditorContent } from '@/lib/hooks/useEditorContent';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useViewMode } from '@/lib/hooks/useViewMode';
import { useDocDirection } from '@/lib/hooks/useDocDirection';
import { useColorTheme } from '@/lib/hooks/useColorTheme';
import { useAiAction } from '@/lib/hooks/useAiAction';
import { useAiDisclosure } from '@/lib/hooks/useAiDisclosure';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { useSubscriptionReturn } from '@/lib/hooks/useSubscriptionReturn';
import { useSubscriptionExpiredNotification } from '@/lib/hooks/useSubscriptionExpiredNotification';
import { Header } from '@/components/layout/Header';
import { ColorPanel } from '@/components/theme/ColorPanel';
import { ExportModal } from '@/components/export/ExportModal';
import { PdfProgress } from '@/components/export/PdfProgress';
import { AiCommandPalette } from '@/components/ai/AiCommandPalette';
import { AiDisclosure } from '@/components/ai/AiDisclosure';
import { AiResultPanel } from '@/components/ai/AiResultPanel';
import { generatePdf } from '@/lib/export/pdf-generator';
import { exportHtml } from '@/lib/export/html-generator';
import { exportMarkdown } from '@/lib/export/md-generator';
import { toast } from 'sonner';
import { copyForWord, copyHtml, copyText } from '@/lib/export/word-copy';
import type { ExportType, CopyType } from '@/types/editor';
import type { AiActionType } from '@/types/ai';
import { PanelLayout } from '@/components/layout/PanelLayout';
import { Footer } from '@/components/layout/Footer';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { PresentationView } from '@/components/preview/PresentationView';
import { SAMPLE_DOCUMENT } from '@/lib/editor/sample-document';

type PdfState = 'idle' | 'generating' | 'success' | 'error';

// Runs once when module loads — before any useState/useLocalStorage initialization
migrateV1Data();

export default function EditorPage() {
  const [content, setContent] = useEditorContent();
  const debouncedContent = useDebounce(content);
  const [viewMode, setViewMode] = useViewMode();
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isColorPanelOpen, setIsColorPanelOpen] = useState(false);
  const [docDirection, setDocDirection] = useDocDirection();
  const [colorTheme, setColorTheme] = useColorTheme();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [pendingExportType, setPendingExportType] = useState<ExportType | null>(null);
  const previewContentRef = useRef<HTMLDivElement>(null);
  const [pendingPdfFilename, setPendingPdfFilename] = useState('');
  const [pdfState, setPdfState] = useState<PdfState>('idle');
  const [isAiPaletteOpen, setIsAiPaletteOpen] = useState(false);
  const { executeAction, isLoading: isAiLoading, result: aiResult, errorCode: aiErrorCode, clearResult: clearAiResult } = useAiAction();
  const { needsDisclosure, acceptDisclosure } = useAiDisclosure();
  const { track } = useAnalytics();
  useSubscriptionReturn();
  useSubscriptionExpiredNotification();
  const [pendingAiAction, setPendingAiAction] = useState<AiActionType | null>(null);
  const [pendingForceOpus, setPendingForceOpus] = useState(false);
  const isAiUnavailable = aiErrorCode === 'AI_UNAVAILABLE';

  // Track login once per browser session (fire-and-forget; skips if unauthenticated)
  useEffect(() => {
    const key = 'marko_session_login_tracked';
    if (!sessionStorage.getItem(key)) {
      track("auth.login");
      sessionStorage.setItem(key, '1');
    }
  }, [track]);

  // Reopen palette when AI limit is reached (AC #4: display exhausted state)
  useEffect(() => {
    if (aiErrorCode === 'AI_LIMIT_REACHED') {
      setIsAiPaletteOpen(true);
      clearAiResult();
    }
  }, [aiErrorCode, clearAiResult]);

  const runAiAction = useCallback(
    async (actionType: AiActionType, forceOpus: boolean = false) => {
      const targetLanguage = actionType === 'translate' ? 'en' : undefined;
      await executeAction(actionType, content, targetLanguage, forceOpus);
      track("ai.action_completed", { actionType });
    },
    [executeAction, content, track]
  );

  const handleAiAction = useCallback(
    (actionType: AiActionType, forceOpus: boolean = false) => {
      if (needsDisclosure) {
        setPendingAiAction(actionType);
        setPendingForceOpus(forceOpus);
        return;
      }
      void runAiAction(actionType, forceOpus);
    },
    [needsDisclosure, runAiAction]
  );

  const handleDisclosureAccept = useCallback(() => {
    acceptDisclosure();
    if (pendingAiAction) {
      void runAiAction(pendingAiAction, pendingForceOpus);
      setPendingAiAction(null);
      setPendingForceOpus(false);
    }
  }, [acceptDisclosure, pendingAiAction, pendingForceOpus, runAiAction]);

  const handleDisclosureCancel = useCallback(() => {
    setPendingAiAction(null);
    setPendingForceOpus(false);
  }, []);

  const handleAiAccept = useCallback(
    (text: string) => {
      setContent(content + '\n\n' + text);
      clearAiResult();
    },
    [content, setContent, clearAiResult]
  );

  const handleViewModeChange = useCallback((mode: typeof viewMode) => {
    setViewMode(mode);
    track("view.mode_change", { mode });
  }, [setViewMode, track]);

  const handleEnterPresentation = useCallback(() => {
    setIsPresentationMode(true);
    track("view.presentation_enter");
  }, [track]);

  const handleThemeChange = useCallback((theme: typeof colorTheme) => {
    setColorTheme(theme);
    track("theme.preset_applied");
  }, [setColorTheme, track]);

  // Ctrl+K / Cmd+K keyboard shortcut — skip when another modal is active
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        if (isExportModalOpen || isColorPanelOpen || isPresentationMode) return;
        e.preventDefault();
        setIsAiPaletteOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExportModalOpen, isColorPanelOpen, isPresentationMode]);

  function handleClearEditor() {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את כל התוכן?')) {
      setContent('');
      track("editor.clear");
    }
  }

  function handleLoadSample() {
    if (content && !window.confirm('האם אתה בטוח? הטעינה תחליף את התוכן הנוכחי.')) return;
    setContent(SAMPLE_DOCUMENT);
    track("editor.load_sample");
  }

  function handleExportRequest(type: ExportType) {
    setPendingExportType(type);
    setIsExportModalOpen(true);
  }

  function handleExportConfirm(filename: string, type: ExportType) {
    track(`export.${type}`);
    if (type === 'pdf') {
      void handlePdfExport(filename);
    } else if (type === 'html') {
      exportHtml(content, colorTheme, docDirection, filename);
    } else if (type === 'markdown') {
      exportMarkdown(content, filename);
    }
  }

  async function handleCopyRequest(type: CopyType) {
    track(`copy.${type}`);
    try {
      if (type === 'word') {
        await copyForWord(content, colorTheme, docDirection);
      } else if (type === 'html') {
        await copyHtml(content, colorTheme, docDirection);
      } else if (type === 'text') {
        await copyText(content);
      }
      toast.success('!הועתק ללוח');
    } catch (e) {
      console.error('Copy to clipboard failed:', e);
      toast.error('שגיאה בהעתקה. נסה שוב.');
    }
  }

  async function handlePdfExport(filename: string) {
    if (pdfState === 'generating') return;
    const element = previewContentRef.current;
    if (!element) {
      window.print();
      return;
    }
    setPendingPdfFilename(filename);
    setPdfState('generating');
    try {
      await generatePdf(element, filename);
      setPdfState('success');
      setTimeout(() => setPdfState('idle'), 3000);
    } catch {
      setPdfState('error');
    }
  }

  return (
    <main
      className="flex h-screen flex-col bg-background-subtle overflow-hidden"
      style={{ paddingTop: 'var(--header-height)', transition: 'background-color 500ms ease' }}
    >
      {isAiUnavailable && (
        <div
          role="alert"
          dir="rtl"
          className="flex items-center justify-between bg-destructive/10 px-4 py-2 text-sm text-destructive"
          data-testid="ai-unavailable-banner"
        >
          <span>AI לא זמין כרגע</span>
          <button
            type="button"
            onClick={clearAiResult}
            className="text-destructive hover:text-destructive/80 text-xs underline"
            aria-label="סגור התראה"
          >
            סגור
          </button>
        </div>
      )}
      <Header
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onEnterPresentation={handleEnterPresentation}
        docDirection={docDirection}
        onDirectionChange={setDocDirection}
        onClearEditor={handleClearEditor}
        onLoadSample={handleLoadSample}
        onOpenColorPanel={() => setIsColorPanelOpen(true)}
        onExportRequest={handleExportRequest}
        onCopyRequest={handleCopyRequest}
      />
      <PanelLayout
        viewMode={viewMode}
        editorPanel={<EditorPanel content={content} onChange={setContent} dir={docDirection} onAiClick={() => setIsAiPaletteOpen(true)} />}
        previewPanel={
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0">
              <PreviewPanel content={debouncedContent} dir={docDirection} contentRef={previewContentRef} />
            </div>
            <AiResultPanel
              isLoading={isAiLoading}
              result={aiResult}
              onAccept={handleAiAccept}
              onDismiss={clearAiResult}
            />
          </div>
        }
      />
      {isPresentationMode && (
        <PresentationView
          content={debouncedContent}
          onExit={() => setIsPresentationMode(false)}
          dir={docDirection}
        />
      )}
      <ColorPanel
        isOpen={isColorPanelOpen}
        onOpenChange={setIsColorPanelOpen}
        theme={colorTheme}
        onThemeChange={handleThemeChange}
      />
      {pendingExportType && (
        <ExportModal
          isOpen={isExportModalOpen}
          onOpenChange={setIsExportModalOpen}
          exportType={pendingExportType}
          content={content}
          onExport={handleExportConfirm}
        />
      )}
      {pdfState !== 'idle' && (
        <PdfProgress
          state={pdfState}
          onRetry={() => void handlePdfExport(pendingPdfFilename)}
          onClose={() => setPdfState('idle')}
          onPrint={() => window.print()}
        />
      )}
      <AiCommandPalette
        open={isAiPaletteOpen}
        onOpenChange={setIsAiPaletteOpen}
        onAction={handleAiAction}
      />
      <AiDisclosure
        open={pendingAiAction !== null}
        onAccept={handleDisclosureAccept}
        onCancel={handleDisclosureCancel}
      />
      <Footer />
    </main>
  );
}
