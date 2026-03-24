'use client';
import { Lock } from 'lucide-react';
import type { Theme } from '@/types/colors';

interface ThemeCardProps {
  theme: Theme;
  isActive: boolean;
  isPremiumLocked: boolean;
  tabIndex: number;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

export function ThemeCard({
  theme,
  isActive,
  isPremiumLocked,
  tabIndex,
  onClick,
  onKeyDown,
}: ThemeCardProps) {
  const { colors, hebrewName } = theme;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      aria-label={`${hebrewName}${isPremiumLocked ? ' (פרימיום)' : ''}`}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={[
        'marko-theme-card relative flex w-full flex-col overflow-hidden rounded-lg border text-start transition-shadow',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        isActive
          ? 'border-2 border-[var(--primary)]'
          : 'border border-[var(--border)] motion-safe:hover:shadow-md',
      ].join(' ')}
    >
      {/* Mini document mockup */}
      <div
        className="flex flex-1 flex-col gap-1 p-2.5"
        style={{ backgroundColor: colors.previewBg }}
      >
        {/* Heading line */}
        <div
          className="truncate font-bold"
          style={{ color: colors.h1, fontSize: '11px', lineHeight: '1.3' }}
          aria-hidden="true"
        >
          כותרת ראשית
        </div>
        {/* Body text lines */}
        <div
          className="leading-tight"
          style={{ color: colors.primaryText, fontSize: '9px', lineHeight: '1.4' }}
          aria-hidden="true"
        >
          טקסט לדוגמה של מסמך בעברית
        </div>
        {/* Code block */}
        <div
          className="mt-0.5 rounded px-1.5 py-1 font-mono"
          style={{
            backgroundColor: colors.codeBg,
            color: colors.code,
            fontSize: '8px',
            lineHeight: '1.3',
          }}
          aria-hidden="true"
        >
          const x = 42;
        </div>
      </div>

      {/* Separator + label area */}
      <div
        className="flex items-center gap-1 px-2.5 py-1.5"
        style={{ borderTop: `1px solid ${colors.hr}`, backgroundColor: colors.previewBg }}
      >
        <span
          className="flex-1 truncate font-medium"
          style={{ color: colors.secondaryText, fontSize: '10px' }}
        >
          {hebrewName}
        </span>
        {isPremiumLocked && (
          <span className="flex items-center gap-0.5" style={{ color: colors.secondaryText, fontSize: '8px' }}>
            <Lock className="size-2.5" aria-hidden="true" />
            <span>פרימיום</span>
          </span>
        )}
      </div>
    </button>
  );
}
