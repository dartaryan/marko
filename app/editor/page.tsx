'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { migrateV1Data } from '@/lib/migration/v1-migration';
import { useEditorContent } from '@/lib/hooks/useEditorContent';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useViewMode } from '@/lib/hooks/useViewMode';
import { useDocDirection } from '@/lib/hooks/useDocDirection';
import { useColorTheme } from '@/lib/hooks/useColorTheme';
import { useAiAction } from '@/lib/hooks/useAiAction';
import { useAiDisclosure } from '@/lib/hooks/useAiDisclosure';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { useSubscriptionReturn } from '@/lib/hooks/useSubscriptionReturn';
import { useSubscriptionExpiredNotification } from '@/lib/hooks/useSubscriptionExpiredNotification';
import { Header } from '@/components/layout/Header';
import { ColorPanel } from '@/components/theme/ColorPanel';
import { ExportModal } from '@/components/export/ExportModal';
import { PdfProgress } from '@/components/export/PdfProgress';
import { AiCommandBar, type CommandBarPosition } from '@/components/ai/AiCommandBar';
import { AiDisclosure } from '@/components/ai/AiDisclosure';
import { AiSuggestionCard } from '@/components/ai/AiSuggestionCard';
import { generatePdf } from '@/lib/export/pdf-generator';
import { exportHtml } from '@/lib/export/html-generator';
import { exportMarkdown } from '@/lib/export/md-generator';
import { toast } from 'sonner';
import { copyForWord, copyHtml, copyText } from '@/lib/export/word-copy';
import type { ExportType, CopyType } from '@/types/editor';
import type { AiActionType } from '@/types/ai';
import { PanelLayout } from '@/components/layout/PanelLayout';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { PresentationView } from '@/components/preview/PresentationView';
import { MobileBottomToolbar } from '@/components/layout/MobileBottomToolbar';
import { SAMPLE_DOCUMENT } from '@/lib/editor/sample-document';

type AiTriggerSource = 'header' | 'slash' | 'selection' | 'keyboard';

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
  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);
  const previewContentRef = useRef<HTMLDivElement>(null);
  const [pendingPdfFilename, setPendingPdfFilename] = useState('');
  const [pdfState, setPdfState] = useState<PdfState>('idle');
  const [isAiBarOpen, setIsAiBarOpen] = useState(false);
  const [aiTriggerSource, setAiTriggerSource] = useState<AiTriggerSource>('header');
  const [aiSelectedText, setAiSelectedText] = useState('');
  const [commandBarPosition, setCommandBarPosition] = useState<CommandBarPosition>('below-header');
  const [commandBarAnchor, setCommandBarAnchor] = useState<{ top: number; left: number } | undefined>();
  const [lastAiActionType, setLastAiActionType] = useState<AiActionType | null>(null);
  const { executeAction, isLoading: isAiLoading, result: aiResult, errorCode: aiErrorCode, clearResult: clearAiResult } = useAiAction();
  const { needsDisclosure, acceptDisclosure } = useAiDisclosure();
  const { isAuthenticated } = useCurrentUser();
  const usage = useQuery(api.usage.getMyMonthlyUsage, isAuthenticated ? {} : 'skip');
  const { track } = useAnalytics();
  useSubscriptionReturn();
  useSubscriptionExpiredNotification();
  const [pendingAiAction, setPendingAiAction] = useState<AiActionType | null>(null);
  const [pendingForceOpus, setPendingForceOpus] = useState(false);
  const [pendingFreeText, setPendingFreeText] = useState<string | undefined>();
  const acceptTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const isAiUnavailable = aiErrorCode === 'AI_UNAVAILABLE';
  const isAtLimit = usage !== undefined && usage.limit !== null && usage.count >= usage.limit;

  // Track login once per browser session (fire-and-forget; skips if unauthenticated)
  useEffect(() => {
    const key = 'marko_session_login_tracked';
    if (!sessionStorage.getItem(key)) {
      track("auth.login");
      sessionStorage.setItem(key, '1');
    }
  }, [track]);

  // When AI limit is reached, reopen the command bar with upgrade gate
  useEffect(() => {
    if (aiErrorCode === 'AI_LIMIT_REACHED') {
      setIsAiBarOpen(true);
      clearAiResult();
    }
  }, [aiErrorCode, clearAiResult]);

  // Cleanup accept timer on unmount
  useEffect(() => {
    return () => {
      if (acceptTimerRef.current) clearTimeout(acceptTimerRef.current);
    };
  }, []);

  const runAiAction = useCallback(
    async (actionType: AiActionType, forceOpus: boolean = false, freeText?: string) => {
      setLastAiActionType(actionType);
      let textToProcess = aiSelectedText || content;
      if (!textToProcess.trim()) return; // Guard against empty content
      // Prepend free-text instruction if provided
      if (freeText) {
        textToProcess = `הוראה: ${freeText}\n\n${textToProcess}`;
      }
      const targetLanguage = actionType === 'translate' ? 'en' : undefined;
      // Capture usage count before the async gap to avoid stale/race-condition values
      const countBefore = usage?.count ?? 0;
      const limit = usage?.limit ?? null;
      const response = await executeAction(actionType, textToProcess, targetLanguage, forceOpus);
      track("ai.action_completed", { actionType });
      // Show usage toast after successful action (Gift, Not Gate pattern)
      if (response && limit !== null) {
        toast.success(`✨ פעולת AI ${countBefore + 1} מתוך ${limit} החודש`);
      }
    },
    [executeAction, content, aiSelectedText, track, usage]
  );

  const handleAiAction = useCallback(
    (actionType: AiActionType, forceOpus: boolean = false, freeText?: string) => {
      if (needsDisclosure) {
        setPendingAiAction(actionType);
        setPendingForceOpus(forceOpus);
        setPendingFreeText(freeText);
        return;
      }
      void runAiAction(actionType, forceOpus, freeText);
    },
    [needsDisclosure, runAiAction]
  );

  const handleDisclosureAccept = useCallback(() => {
    acceptDisclosure();
    if (pendingAiAction) {
      void runAiAction(pendingAiAction, pendingForceOpus, pendingFreeText);
      setPendingAiAction(null);
      setPendingForceOpus(false);
      setPendingFreeText(undefined);
    }
  }, [acceptDisclosure, pendingAiAction, pendingForceOpus, pendingFreeText, runAiAction]);

  const handleDisclosureCancel = useCallback(() => {
    setPendingAiAction(null);
    setPendingForceOpus(false);
    setPendingFreeText(undefined);
  }, []);

  const handleAiAccept = useCallback(
    (text: string) => {
      if (aiSelectedText) {
        // Replace the selected text with the AI result
        setContent((prev) => prev.replace(aiSelectedText, text));
      } else {
        // Append to end of document
        setContent((prev) => prev + '\n\n' + text);
      }
      setAiSelectedText('');
      track("ai.result_accepted");
      // Delay clearing result so the suggestion card can show "הוכנס!" feedback briefly
      acceptTimerRef.current = setTimeout(() => clearAiResult(), 400);
    },
    [aiSelectedText, setContent, clearAiResult, track]
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

  // Entry point: Header AI button click
  const handleHeaderAiClick = useCallback(() => {
    setAiTriggerSource('header');
    setCommandBarPosition('below-header');
    setCommandBarAnchor(undefined);
    setAiSelectedText('');
    setIsAiBarOpen(true);
  }, []);

  // Entry point: Slash command from editor
  const handleSlashCommand = useCallback((cursorTop: number, cursorLeft: number) => {
    setAiTriggerSource('slash');
    setCommandBarPosition('above-selection');
    setCommandBarAnchor({ top: cursorTop, left: cursorLeft });
    setAiSelectedText('');
    setIsAiBarOpen(true);
  }, []);

  // Entry point: Selection toolbar sparkle click
  const handleSelectionAiClick = useCallback((selectedText: string, rect: { top: number; left: number }) => {
    setAiTriggerSource('selection');
    setCommandBarPosition('above-selection');
    setCommandBarAnchor({ top: rect.top, left: rect.left });
    setAiSelectedText(selectedText);
    setIsAiBarOpen(true);
  }, []);

  // Regenerate last AI action
  const handleRegenerate = useCallback(() => {
    if (lastAiActionType) {
      void runAiAction(lastAiActionType);
    }
  }, [lastAiActionType, runAiAction]);

  // Ctrl+J / Cmd+J keyboard shortcut — skip when another modal is active
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        if (isExportModalOpen || isColorPanelOpen || isPresentationMode) return;
        e.preventDefault();
        setAiTriggerSource('keyboard');
        setCommandBarPosition('below-header');
        setCommandBarAnchor(undefined);
        // If text is selected in the editor, use it as context
        const activeEl = document.activeElement as HTMLTextAreaElement | null;
        if (activeEl?.tagName === 'TEXTAREA' && activeEl.selectionStart !== activeEl.selectionEnd) {
          setAiSelectedText(activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd));
        } else {
          setAiSelectedText('');
        }
        setIsAiBarOpen(true);
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
        onAiClick={handleHeaderAiClick}
      />
      <PanelLayout
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        hasBottomToolbar={!isPresentationMode && viewMode !== 'preview'}
        editorPanel={
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-hidden">
              <EditorPanel
                content={content}
                onChange={setContent}
                dir={docDirection}
                onSlashCommand={handleSlashCommand}
                onSelectionAiClick={handleSelectionAiClick}
                textareaRef={editorTextareaRef}
              />
            </div>
            <AiSuggestionCard
              isLoading={isAiLoading}
              result={aiResult}
              onAccept={handleAiAccept}
              onDismiss={clearAiResult}
              onRegenerate={lastAiActionType ? handleRegenerate : undefined}
              isBlurred={isAtLimit}
            />
          </div>
        }
        previewPanel={
          <PreviewPanel content={debouncedContent} dir={docDirection} contentRef={previewContentRef} />
        }
      />
      {!isPresentationMode && (
        <MobileBottomToolbar viewMode={viewMode} textareaRef={editorTextareaRef} onContentChange={setContent} />
      )}
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
      <AiCommandBar
        open={isAiBarOpen}
        onOpenChange={setIsAiBarOpen}
        onAction={handleAiAction}
        position={commandBarPosition}
        anchorRect={commandBarAnchor}
        selectedText={aiSelectedText}
      />
      <AiDisclosure
        open={pendingAiAction !== null}
        onAccept={handleDisclosureAccept}
        onCancel={handleDisclosureCancel}
      />
    </main>
  );
}
