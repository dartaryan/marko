'use client';
import { useState, useRef } from 'react';
import { migrateV1Data } from '@/lib/migration/v1-migration';
import { useEditorContent } from '@/lib/hooks/useEditorContent';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useViewMode } from '@/lib/hooks/useViewMode';
import { useDocDirection } from '@/lib/hooks/useDocDirection';
import { useColorTheme } from '@/lib/hooks/useColorTheme';
import { Header } from '@/components/layout/Header';
import { ColorPanel } from '@/components/theme/ColorPanel';
import { ExportModal } from '@/components/export/ExportModal';
import { PdfProgress } from '@/components/export/PdfProgress';
import { generatePdf } from '@/lib/export/pdf-generator';
import { exportHtml } from '@/lib/export/html-generator';
import { exportMarkdown } from '@/lib/export/md-generator';
import type { ExportType } from '@/types/editor';
import { PanelLayout } from '@/components/layout/PanelLayout';
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

  function handleClearEditor() {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את כל התוכן?')) {
      setContent('');
    }
  }

  function handleLoadSample() {
    if (content && !window.confirm('האם אתה בטוח? הטעינה תחליף את התוכן הנוכחי.')) return;
    setContent(SAMPLE_DOCUMENT);
  }

  function handleExportRequest(type: ExportType) {
    setPendingExportType(type);
    setIsExportModalOpen(true);
  }

  function handleExportConfirm(filename: string, type: ExportType) {
    if (type === 'pdf') {
      void handlePdfExport(filename);
    } else if (type === 'html') {
      exportHtml(content, colorTheme, docDirection, filename);
    } else if (type === 'markdown') {
      exportMarkdown(content, filename);
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
    <main className="flex h-screen flex-col">
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onEnterPresentation={() => setIsPresentationMode(true)}
        docDirection={docDirection}
        onDirectionChange={setDocDirection}
        onClearEditor={handleClearEditor}
        onLoadSample={handleLoadSample}
        onOpenColorPanel={() => setIsColorPanelOpen(true)}
        onExportRequest={handleExportRequest}
      />
      <PanelLayout
        viewMode={viewMode}
        editorPanel={<EditorPanel content={content} onChange={setContent} dir={docDirection} />}
        previewPanel={<PreviewPanel content={debouncedContent} dir={docDirection} contentRef={previewContentRef} />}
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
        onThemeChange={setColorTheme}
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
    </main>
  );
}
