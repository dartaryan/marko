'use client';
import { getContrastRatio, meetsWCAG_AA } from '@/lib/colors/contrast';

interface ContrastIndicatorProps {
  textHex: string;
  bgHex: string;
}

export function ContrastIndicator({ textHex, bgHex }: ContrastIndicatorProps) {
  const ratio = getContrastRatio(textHex, bgHex);
  const passes = meetsWCAG_AA(textHex, bgHex);

  return (
    <div
      className="flex items-center gap-1.5"
      style={{ fontSize: 'var(--text-caption)' }}
      aria-label={`ניגודיות ${ratio.toFixed(1)} ל-1, ${passes ? 'עובר' : 'נכשל'}`}
    >
      <span className="text-[var(--foreground-muted)]">ניגודיות:</span>
      <span className={passes ? 'text-[var(--success)]' : 'text-[var(--warning)]'}>
        {ratio.toFixed(1)}:1 {passes ? '\u2713' : '\u26A0'}
      </span>
    </div>
  );
}
