// Deprecated by S12.3 — direction control moved to overflow menu (OverflowMenu.tsx) and DirectionIndicator.
// Kept for reference — may be useful for S14.2 Settings page.
'use client';
import type { DocDirection } from '@/types/editor';

interface DirectionToggleProps {
  value: DocDirection;
  onChange: (dir: DocDirection) => void;
}

const DIRECTIONS: { value: DocDirection; label: string; ariaLabel: string }[] = [
  { value: 'auto', label: 'BiDi', ariaLabel: 'זיהוי כיוון אוטומטי' },
  { value: 'rtl', label: 'RTL', ariaLabel: 'כיוון מימין לשמאל' },
  { value: 'ltr', label: 'LTR', ariaLabel: 'כיוון משמאל לימין' },
];

export function DirectionToggle({ value, onChange }: DirectionToggleProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    const currentIndex = DIRECTIONS.findIndex((d) => d.value === value);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(DIRECTIONS[(currentIndex + 1) % DIRECTIONS.length].value);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(DIRECTIONS[(currentIndex - 1 + DIRECTIONS.length) % DIRECTIONS.length].value);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="כיוון מסמך"
      className="flex items-center rounded-[8px] bg-[rgba(16,185,129,0.1)] p-[3px] gap-0.5"
      onKeyDown={handleKeyDown}
    >
      {DIRECTIONS.map((dir) => (
        <button
          key={dir.value}
          type="button"
          role="radio"
          aria-checked={value === dir.value}
          aria-label={dir.ariaLabel}
          title={dir.ariaLabel}
          onClick={() => onChange(dir.value)}
          className={`rounded-[6px] px-3 py-1 text-[13px] font-medium transition-all duration-200 ${
            value === dir.value
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'text-[#a7f3d0] hover:text-white'
          }`}
        >
          {dir.label}
        </button>
      ))}
    </div>
  );
}
