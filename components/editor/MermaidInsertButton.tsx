'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { MERMAID_TEMPLATES, getMermaidTemplate } from '@/lib/markdown/mermaid-templates';

interface MermaidInsertButtonProps {
  onInsert: (template: string) => void;
}

export function MermaidInsertButton({ onInsert }: MermaidInsertButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus first menu item when menu opens
  useEffect(() => {
    if (!isOpen) return;
    const firstItem = dropdownRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    firstItem?.focus();
  }, [isOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const handleSelect = (key: string) => {
    onInsert(getMermaidTemplate(key));
    close();
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const items = Array.from(
          dropdownRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
        );
        const currentIndex = items.indexOf(document.activeElement as HTMLElement);
        const nextIndex =
          e.key === 'ArrowDown'
            ? (currentIndex + 1) % items.length
            : (currentIndex - 1 + items.length) % items.length;
        items[nextIndex]?.focus();
      }
    },
    [isOpen, close]
  );

  return (
    <div ref={dropdownRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="הוסף תרשים Mermaid"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex h-6 items-center gap-1 rounded px-2 text-xs text-muted-foreground
                   hover:bg-muted hover:text-foreground transition-colors"
      >
        <span>תרשים</span>
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="סוגי תרשימים"
          className="absolute start-0 top-full z-50 mt-1 min-w-44 rounded-md border border-border
                     bg-popover shadow-md"
        >
          {MERMAID_TEMPLATES.map((template) => (
            <button
              key={template.key}
              role="menuitem"
              type="button"
              tabIndex={-1}
              onClick={() => handleSelect(template.key)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-start text-sm
                         text-popover-foreground hover:bg-muted transition-colors"
            >
              <span>{template.labelHe}</span>
              <span className="ms-auto text-xs text-muted-foreground">{template.labelEn}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
