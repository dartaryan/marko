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
      className="flex items-center rounded-md border border-white/20 bg-white/10 p-0.5 gap-0.5"
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
          className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
            value === dir.value
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-emerald-200 hover:text-white'
          }`}
        >
          {dir.label}
        </button>
      ))}
    </div>
  );
}
