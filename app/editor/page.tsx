'use client';
import { useState } from 'react';
import { useEditorContent } from '@/lib/hooks/useEditorContent';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useViewMode } from '@/lib/hooks/useViewMode';
import { Header } from '@/components/layout/Header';
import { PanelLayout } from '@/components/layout/PanelLayout';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { PresentationView } from '@/components/preview/PresentationView';

export default function EditorPage() {
  const [content, setContent] = useEditorContent();
  const debouncedContent = useDebounce(content);
  const [viewMode, setViewMode] = useViewMode();
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  return (
    <main className="flex h-screen flex-col">
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onEnterPresentation={() => setIsPresentationMode(true)}
      />
      <PanelLayout
        viewMode={viewMode}
        editorPanel={<EditorPanel content={content} onChange={setContent} />}
        previewPanel={<PreviewPanel content={debouncedContent} />}
      />
      {isPresentationMode && (
        <PresentationView
          content={debouncedContent}
          onExit={() => setIsPresentationMode(false)}
        />
      )}
    </main>
  );
}
