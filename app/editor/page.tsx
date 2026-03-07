'use client';
import { useState } from 'react';
import { migrateV1Data } from '@/lib/migration/v1-migration';
import { useEditorContent } from '@/lib/hooks/useEditorContent';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useViewMode } from '@/lib/hooks/useViewMode';
import { useDocDirection } from '@/lib/hooks/useDocDirection';
import { useColorTheme } from '@/lib/hooks/useColorTheme';
import { Header } from '@/components/layout/Header';
import { ColorPanel } from '@/components/theme/ColorPanel';
import { PanelLayout } from '@/components/layout/PanelLayout';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { PresentationView } from '@/components/preview/PresentationView';
import { SAMPLE_DOCUMENT } from '@/lib/editor/sample-document';

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

  function handleClearEditor() {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את כל התוכן?')) {
      setContent('');
    }
  }

  function handleLoadSample() {
    if (content && !window.confirm('האם אתה בטוח? הטעינה תחליף את התוכן הנוכחי.')) return;
    setContent(SAMPLE_DOCUMENT);
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
      />
      <PanelLayout
        viewMode={viewMode}
        editorPanel={<EditorPanel content={content} onChange={setContent} dir={docDirection} />}
        previewPanel={<PreviewPanel content={debouncedContent} dir={docDirection} />}
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
    </main>
  );
}
