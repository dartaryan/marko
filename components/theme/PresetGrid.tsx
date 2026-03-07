'use client';
import { useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { COLOR_PRESETS } from '@/lib/colors/presets';
import type { ColorTheme, CustomPreset } from '@/types/colors';

interface PresetGridProps {
  activePreset: string; // preset name or '' for custom
  onPresetSelect: (name: string, theme: ColorTheme) => void;
  customPresets: CustomPreset[];
  onCustomPresetSelect: (colors: ColorTheme) => void;
  onDeleteCustomPreset: (index: number) => void;
}

function getPresetGradient(theme: ColorTheme): string {
  return `linear-gradient(135deg, ${theme.previewBg} 0%, ${theme.h1} 50%, ${theme.link} 90%)`;
}

const COLS = 5;

export function PresetGrid({
  activePreset,
  onPresetSelect,
  customPresets,
  onCustomPresetSelect,
  onDeleteCustomPreset,
}: PresetGridProps) {
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
    <div>
      {/* Built-in presets: 5-column radiogroup */}
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

      {/* Custom presets: list rows with swatch, name, delete */}
      {customPresets.length > 0 && (
        <div className="mt-3" role="group" aria-label="נושאים מותאמים אישית">
          <h4 className="mb-1.5 text-xs font-medium text-muted-foreground">נושאים שלי</h4>
          <div className="space-y-1">
            {customPresets.map((preset, index) => (
              <div key={`${preset.name}-${index}`} className="flex items-center gap-2">
                {/* Gradient swatch — decorative, name button handles keyboard access */}
                <button
                  type="button"
                  onClick={() => onCustomPresetSelect(preset.colors)}
                  style={{ background: getPresetGradient(preset.colors) }}
                  className="h-6 w-8 flex-shrink-0 rounded transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 motion-safe:hover:scale-105 motion-safe:active:scale-95"
                  aria-hidden="true"
                  tabIndex={-1}
                  title={preset.name}
                />
                {/* Preset name — the keyboard-accessible action button */}
                <button
                  type="button"
                  onClick={() => onCustomPresetSelect(preset.colors)}
                  className="flex-1 truncate text-start text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:underline"
                  aria-label={`הפעל נושא ${preset.name}`}
                >
                  {preset.name}
                </button>
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => onDeleteCustomPreset(index)}
                  className="flex-shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`מחק נושא ${preset.name}`}
                  title={`מחק ${preset.name}`}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
