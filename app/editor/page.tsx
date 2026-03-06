'use client';
import { useEditorContent } from '@/lib/hooks/useEditorContent';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Header } from '@/components/layout/Header';
import { PanelLayout } from '@/components/layout/PanelLayout';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { PreviewPanel } from '@/components/preview/PreviewPanel';

export default function EditorPage() {
  const [content, setContent] = useEditorContent();
  const debouncedContent = useDebounce(content); // 150ms debounce for preview

  return (
    <main className="flex h-screen flex-col">
      <Header />
      <PanelLayout
        editorPanel={<EditorPanel content={content} onChange={setContent} />}
        previewPanel={<PreviewPanel content={debouncedContent} />}
      />
    </main>
  );
}
