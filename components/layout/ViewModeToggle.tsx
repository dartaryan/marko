'use client';
import { useRef } from 'react';
import type { ViewMode } from '@/types/editor';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const MODES: { value: ViewMode; labelHe: string; ariaLabel: string }[] = [
  { value: 'editor',  labelHe: 'עורך',    ariaLabel: 'מצב עורך בלבד' },
  { value: 'split',   labelHe: 'שניהם',   ariaLabel: 'מצב פיצול' },
  { value: 'preview', labelHe: 'תצוגה',   ariaLabel: 'מצב תצוגה בלבד' },
];

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = MODES.findIndex(m => m.value === value);
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % MODES.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + MODES.length) % MODES.length;
    } else {
      return;
    }
    onChange(MODES[nextIndex].value);
    buttonsRef.current[nextIndex]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="מצב תצוגה"
      className="flex items-center rounded-[8px] bg-[rgba(16,185,129,0.1)] p-[3px] gap-0.5"
      onKeyDown={handleKeyDown}
    >
      {MODES.map((mode, i) => (
        <button
          key={mode.value}
          ref={el => { buttonsRef.current[i] = el; }}
          type="button"
          role="radio"
          aria-checked={value === mode.value}
          aria-label={mode.ariaLabel}
          title={mode.ariaLabel}
          tabIndex={value === mode.value ? 0 : -1}
          onClick={() => onChange(mode.value)}
          suppressHydrationWarning
          className={`rounded-[6px] px-3 py-1 text-[13px] font-medium transition-all duration-200 ${
            value === mode.value
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'text-[#a7f3d0] hover:text-white'
          }`}
        >
          {mode.labelHe}
        </button>
      ))}
    </div>
  );
}
