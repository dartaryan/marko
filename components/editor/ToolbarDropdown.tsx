'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownItem {
  label: string;
  labelEn?: string;
  value: string;
}

interface ToolbarDropdownProps {
  triggerAriaLabel: string;
  triggerLabel: string;
  title?: string;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  onBeforeOpen?: () => void;
}

export function ToolbarDropdown({ triggerAriaLabel, triggerLabel, title, items, onSelect, onBeforeOpen }: ToolbarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Outside-click close (same pattern as MermaidInsertButton)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Focus first item when menu opens (same pattern as MermaidInsertButton)
  useEffect(() => {
    if (!isOpen) return;
    const first = containerRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    first?.focus();
  }, [isOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

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
        const menuItems = Array.from(
          containerRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
        );
        const idx = menuItems.indexOf(document.activeElement as HTMLElement);
        const next =
          e.key === 'ArrowDown'
            ? (idx + 1) % menuItems.length
            : (idx - 1 + menuItems.length) % menuItems.length;
        menuItems[next]?.focus();
      }
    },
    [isOpen, close]
  );

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!isOpen) onBeforeOpen?.();
          setIsOpen((prev) => !prev);
        }}
        aria-label={triggerAriaLabel}
        title={title ?? triggerAriaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="marko-toolbar-btn h-8 px-2 text-[13px] gap-1"
      >
        <span>{triggerLabel}</span>
        <ChevronDown className="size-3" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={triggerAriaLabel}
          className="absolute start-0 top-full z-50 mt-1 min-w-36 rounded-md border
                     border-border bg-popover shadow-[var(--shadow-2)] animate-slide-down"
        >
          {items.map((item) => (
            <button
              key={item.value}
              role="menuitem"
              type="button"
              tabIndex={-1}
              onClick={() => {
                onSelect(item.value);
                close();
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-start text-sm
                         text-popover-foreground hover:bg-primary-ghost transition-colors"
            >
              <span>{item.label}</span>
              {item.labelEn && (
                <span className="ms-auto text-xs text-muted-foreground">{item.labelEn}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
