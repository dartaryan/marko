'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { MarkdownRenderer } from '@/components/preview/MarkdownRenderer';

import type { DocDirection } from '@/types/editor';

interface PresentationViewProps {
  content: string;
  onExit: () => void;
  dir?: DocDirection;
}

const IDLE_TIMEOUT_MS = 3000;

export function PresentationView({ content, onExit, dir = 'rtl' }: PresentationViewProps) {
  const [mounted, setMounted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useRef(false);

  // Fade-in + reduced motion detection + focus management
  useEffect(() => {
    prefersReducedMotion.current =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setMounted(true);
    containerRef.current?.focus();
  }, []);

  // Escape key + focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = Array.from(
          containerRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) ?? []
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  // Idle timer
  const resetIdleTimer = useCallback(() => {
    setControlsVisible(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(
      () => setControlsVisible(false),
      IDLE_TIMEOUT_MS
    );
  }, []);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  return (
    <div
      ref={containerRef}
      role="document"
      aria-label="מצב מצגת — לחץ Escape ליציאה"
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-y-auto bg-background outline-none"
      onMouseMove={resetIdleTimer}
      style={{
        opacity: mounted ? 1 : 0,
        transition: prefersReducedMotion.current
          ? 'none'
          : 'opacity 300ms ease-out',
      }}
    >
      {/* Hover controls — top-start corner, logical RTL-safe positioning */}
      <div
        className="fixed start-4 top-4 z-10 transition-opacity duration-200"
        style={{
          opacity: controlsVisible ? 1 : 0,
          pointerEvents: controlsVisible ? 'auto' : 'none',
        }}
        aria-hidden={!controlsVisible}
      >
        <button
          type="button"
          onClick={onExit}
          aria-label="יציאה ממצגת"
          title="יציאה ממצגת (Escape)"
          tabIndex={controlsVisible ? 0 : -1}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border
                     bg-background/80 text-foreground backdrop-blur-sm
                     hover:bg-muted transition-colors shadow-sm"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* Presentation content — centred, max-width for readability */}
      <div className="presentation-content">
        <MarkdownRenderer content={content} dir={dir} />
      </div>
    </div>
  );
}
