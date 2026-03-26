'use client';
import { useState } from 'react';
import { Pin } from 'lucide-react';
import { DocumentContextMenu } from './DocumentContextMenu';
import { getRelativeDate } from '@/lib/documents/utils';
import type { Document } from '@/types/document';

interface DocumentListItemProps {
  document: Document;
  isActive: boolean;
  onSelect: () => void;
  onPin: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  searchQuery?: string;
}

/** Highlight matching substrings in text for search. */
function HighlightText({ text, query }: { text: string; query?: string }) {
  if (!query || !query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  const lowerQuery = query.toLowerCase();
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === lowerQuery ? (
          <mark key={i} className="bg-primary/20 text-inherit rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function DocumentListItem({
  document: doc,
  isActive,
  onSelect,
  onPin,
  onDelete,
  onDuplicate,
  searchQuery,
}: DocumentListItemProps) {
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  return (
    <div
      role="option"
      aria-selected={isActive}
      data-doc-id={doc.id}
      tabIndex={0}
      onClick={onSelect}
      onContextMenu={(e) => {
        e.preventDefault();
        setIsContextMenuOpen(true);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={[
        'group relative cursor-pointer rounded-lg px-3 py-2.5 transition-colors',
        'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'bg-primary/10 ring-1 ring-primary/30'
          : '',
      ].join(' ')}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {doc.isPinned && (
              <Pin className="size-3 flex-shrink-0 text-primary" aria-label="מוצמד" />
            )}
            <span className="truncate text-sm font-semibold text-foreground">
              <HighlightText text={doc.title} query={searchQuery} />
            </span>
          </div>
          {doc.snippet && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              <HighlightText text={doc.snippet} query={searchQuery} />
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground/70">
            {getRelativeDate(doc.updatedAt)}
          </p>
        </div>
        <DocumentContextMenu
          isPinned={doc.isPinned}
          title={doc.title}
          onPin={onPin}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          open={isContextMenuOpen}
          onOpenChange={setIsContextMenuOpen}
        />
      </div>
    </div>
  );
}
