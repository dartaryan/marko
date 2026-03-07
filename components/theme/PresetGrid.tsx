'use client';
import { useRef, useCallback } from 'react';
import { COLOR_PRESETS } from '@/lib/colors/presets';
import type { ColorTheme } from '@/types/colors';

interface PresetGridProps {
  activePreset: string; // preset name or '' for custom
  onPresetSelect: (name: string, theme: ColorTheme) => void;
}

function getPresetGradient(theme: ColorTheme): string {
  return `linear-gradient(135deg, ${theme.previewBg} 0%, ${theme.h1} 50%, ${theme.link} 90%)`;
}

const COLS = 5;

export function PresetGrid({ activePreset, onPresetSelect }: PresetGridProps) {
  const groupRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = COLOR_PRESETS.length;
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % count;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + count) % count;
    else if (e.key === 'ArrowDown') nextIndex = Math.min(index + COLS, count - 1);
    else if (e.key === 'ArrowUp') nextIndex = Math.max(index - COLS, 0);

    if (nextIndex !== null) {
      e.preventDefault();
      const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      if (buttons?.[nextIndex]) {
        buttons.forEach((btn, i) => { btn.tabIndex = i === nextIndex ? 0 : -1; });
        buttons[nextIndex].focus();
      }
    }
  }, []);

  const activeIndex = COLOR_PRESETS.findIndex((p) => p.name === activePreset);
  const tabbableIndex = activeIndex >= 0 ? activeIndex : 0;

  return (
    <div ref={groupRef} className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="נושאי צבע">
      {COLOR_PRESETS.map((preset, index) => {
        const isActive = preset.name === activePreset;
        return (
          <button
            key={preset.name}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={preset.hebrewName}
            title={preset.hebrewName}
            tabIndex={index === tabbableIndex ? 0 : -1}
            onClick={() => onPresetSelect(preset.name, preset.theme)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            style={{ background: getPresetGradient(preset.theme) }}
            className={[
              'h-9 w-full rounded transition-transform',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              isActive
                ? 'ring-2 ring-primary ring-offset-1'
                : 'motion-safe:hover:scale-105',
              'motion-safe:active:scale-95',
            ].join(' ')}
          />
        );
      })}
    </div>
  );
}
