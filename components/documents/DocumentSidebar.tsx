'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { DocumentListItem } from './DocumentListItem';
import { DocumentSearch } from './DocumentSearch';
import { DocumentEmptyState } from './DocumentEmptyState';
import type { Document } from '@/types/document';

interface DocumentSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documents: Document[];
  activeDocumentId: string | null;
  isLoading: boolean;
  onSelectDocument: (id: string) => void;
  onCreateDocument: () => void;
  onPinDocument: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  onDuplicateDocument: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredDocuments: Document[];
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse space-y-2 rounded-lg bg-muted/50 p-3">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-1/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function SidebarContent({
  documents,
  filteredDocuments,
  activeDocumentId,
  isLoading,
  onSelectDocument,
  onCreateDocument,
  onPinDocument,
  onDeleteDocument,
  onDuplicateDocument,
  searchQuery,
  onSearchChange,
}: Omit<DocumentSidebarProps, 'isOpen' | 'onOpenChange'>) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!listRef.current) return;
      const items = Array.from(listRef.current.querySelectorAll<HTMLElement>('[role="option"]'));
      const idx = items.indexOf(document.activeElement as HTMLElement);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = idx < items.length - 1 ? idx + 1 : 0;
        items[next]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = idx > 0 ? idx - 1 : items.length - 1;
        items[prev]?.focus();
      } else if (e.key === 'Enter' && idx >= 0) {
        e.preventDefault();
        const docId = items[idx]?.getAttribute('data-doc-id');
        if (docId) onSelectDocument(docId);
      }
    },
    [onSelectDocument]
  );

  if (isLoading) return <SidebarSkeleton />;

  if (documents.length === 0) {
    return <DocumentEmptyState onCreateDocument={onCreateDocument} />;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <DocumentSearch value={searchQuery} onChange={onSearchChange} />
        <button
          type="button"
          onClick={onCreateDocument}
          aria-label="מסמך חדש"
          title="מסמך חדש"
          className="flex-shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div
        ref={listRef}
        role="listbox"
        aria-label="רשימת מסמכים"
        className="flex-1 overflow-y-auto px-2 pb-2"
        onKeyDown={handleKeyDown}
      >
        {filteredDocuments.length === 0 && searchQuery ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">לא נמצאו מסמכים</p>
        ) : (
          filteredDocuments.map((doc) => (
            <DocumentListItem
              key={doc.id}
              document={doc}
              isActive={doc.id === activeDocumentId}
              onSelect={() => onSelectDocument(doc.id)}
              onPin={() => onPinDocument(doc.id)}
              onDelete={() => onDeleteDocument(doc.id)}
              onDuplicate={() => onDuplicateDocument(doc.id)}
              searchQuery={searchQuery}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function DocumentSidebar(props: DocumentSidebarProps) {
  const { isOpen, onOpenChange } = props;
  const isDesktop = useIsDesktop();

  // Ctrl+\ keyboard shortcut — skip in input/textarea fields (P14)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        onOpenChange(!isOpen);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onOpenChange]);

  const contentProps = {
    documents: props.documents,
    activeDocumentId: props.activeDocumentId,
    isLoading: props.isLoading,
    onSelectDocument: props.onSelectDocument,
    onCreateDocument: props.onCreateDocument,
    onPinDocument: props.onPinDocument,
    onDeleteDocument: props.onDeleteDocument,
    onDuplicateDocument: props.onDuplicateDocument,
    searchQuery: props.searchQuery,
    onSearchChange: props.onSearchChange,
    filteredDocuments: props.filteredDocuments,
  };

  // Desktop (>1024px): inline 260px aside panel that pushes content
  if (isDesktop) {
    if (!isOpen) return null;
    return (
      <aside
        className="marko-document-sidebar flex w-[260px] flex-shrink-0 flex-col border-s border-border bg-surface overflow-hidden motion-safe:animate-in motion-safe:slide-in-from-end motion-safe:duration-300"
        aria-label="רשימת מסמכים"
      >
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <h2 className="text-sm font-semibold text-foreground">מסמכים</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="סגור רשימת מסמכים"
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <SidebarContent {...contentProps} />
      </aside>
    );
  }

  // Tablet/Mobile (<1024px): Sheet overlay
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0" showCloseButton>
        <SheetHeader className="border-b border-border px-3 py-2">
          <SheetTitle className="text-sm">מסמכים</SheetTitle>
          <SheetDescription className="sr-only">רשימת מסמכים שמורים</SheetDescription>
        </SheetHeader>
        <SidebarContent {...contentProps} />
      </SheetContent>
    </Sheet>
  );
}
