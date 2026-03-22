'use client';
import type { DocDirection } from '@/types/editor';

interface DirectionIndicatorProps {
  value: DocDirection;
  onChange: (dir: DocDirection) => void;
}

const CYCLE_ORDER: DocDirection[] = ['auto', 'rtl', 'ltr'];

const LABELS: Record<DocDirection, string> = {
  auto: 'BiDi',
  rtl: 'RTL',
  ltr: 'LTR',
};

const TOOLTIPS: Record<DocDirection, string> = {
  auto: 'כיוון טקסט: אוטומטי',
  rtl: 'כיוון טקסט: ימין לשמאל',
  ltr: 'כיוון טקסט: שמאל לימין',
};

export function DirectionIndicator({ value, onChange }: DirectionIndicatorProps) {
  function cycle() {
    const idx = CYCLE_ORDER.indexOf(value);
    const next = CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length];
    onChange(next);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cycle();
    }
  }

  return (
    <span
      role="button"
      tabIndex={0}
      className="marko-direction-indicator"
      title={TOOLTIPS[value]}
      aria-label={TOOLTIPS[value]}
      onClick={cycle}
      onKeyDown={handleKeyDown}
    >
      {LABELS[value]}
    </span>
  );
}
