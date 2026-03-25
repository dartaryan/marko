'use client';
import { useState, useCallback } from 'react';
import { Paintbrush, ChevronDown } from 'lucide-react';
import { HslWheel } from './HslWheel';
import { ContrastIndicator } from './ContrastIndicator';
import { generateThemeFromAccent } from '@/lib/colors/accent-generator';
import type { ColorTheme } from '@/types/colors';

interface AccentCustomizerProps {
  onThemeChange: (theme: ColorTheme) => void;
  onClearActiveSelections: () => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export function AccentCustomizer({
  onThemeChange,
  onClearActiveSelections,
  expanded,
  onExpandedChange,
}: AccentCustomizerProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [accent, setAccent] = useState<{ h: number; s: number; l: number }>({
    h: 160,
    s: 70,
    l: 50,
  });
  const [generatedTheme, setGeneratedTheme] = useState<ColorTheme | null>(null);

  const isExpanded = expanded ?? internalExpanded;
  const setIsExpanded = onExpandedChange ?? setInternalExpanded;

  const handleAccentChange = useCallback(
    (hsl: { h: number; s: number; l: number }) => {
      setAccent(hsl);
      const theme = generateThemeFromAccent(hsl);
      setGeneratedTheme(theme);
      onThemeChange(theme);
      onClearActiveSelections();
    },
    [onThemeChange, onClearActiveSelections]
  );

  // Use generated theme for contrast indicator, or generate a preview
  const previewTheme = generatedTheme ?? generateThemeFromAccent(accent);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-1 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
        style={{ fontSize: 'var(--text-body-sm)' }}
        aria-expanded={isExpanded}
        aria-label="התאמה אישית"
      >
        <ChevronDown
          className={`size-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
        <Paintbrush className="size-3.5" aria-hidden="true" />
        <span className="font-medium">התאמה אישית</span>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-3">
          <HslWheel value={accent} onChange={handleAccentChange} />
          <ContrastIndicator
            textHex={previewTheme.primaryText}
            bgHex={previewTheme.previewBg}
          />
        </div>
      )}
    </div>
  );
}
