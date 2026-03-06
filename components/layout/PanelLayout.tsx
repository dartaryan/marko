interface PanelLayoutProps {
  editorPanel: React.ReactNode;
  previewPanel: React.ReactNode;
}

export function PanelLayout({ editorPanel, previewPanel }: PanelLayoutProps) {
  return (
    <div
      className="grid h-[calc(100vh-var(--header-height,3.5rem))] grid-cols-1 lg:grid-cols-2"
      aria-label="פאנל עורך ותצוגה מקדימה"
    >
      {editorPanel}
      {previewPanel}
    </div>
  );
}
