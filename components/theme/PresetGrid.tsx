'use client';
import { useState, useRef, useCallback } from 'react';
import { X, Lock, ChevronDown } from 'lucide-react';
import { COLOR_PRESETS } from '@/lib/colors/presets';
import { CURATED_THEMES, canApplyTheme } from '@/lib/colors/themes';
import type { ColorTheme, CustomPreset, Theme } from '@/types/colors';

interface PresetGridProps {
  activePreset: string; // preset name or '' for custom
  activeThemeId: string; // curated theme ID or '' for none
  userTier: 'free' | 'paid' | 'anonymous' | 'loading';
  onPresetSelect: (name: string, theme: ColorTheme) => void;
  onCuratedThemeSelect: (theme: Theme) => void;
  onPremiumBlocked: () => void;
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
  activeThemeId,
  userTier,
  onPresetSelect,
  onCuratedThemeSelect,
  onPremiumBlocked,
  customPresets,
  onCustomPresetSelect,
  onDeleteCustomPreset,
}: PresetGridProps) {
  const curatedRef = useRef<HTMLDivElement>(null);
  const legacyRef = useRef<HTMLDivElement>(null);
  const [showLegacy, setShowLegacy] = useState(false);

  const handleCuratedKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = CURATED_THEMES.length;
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % count;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + count) % count;
    else if (e.key === 'ArrowDown') nextIndex = Math.min(index + COLS, count - 1);
    else if (e.key === 'ArrowUp') nextIndex = Math.max(index - COLS, 0);

    if (nextIndex !== null) {
      e.preventDefault();
      const buttons = curatedRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      if (buttons?.[nextIndex]) {
        buttons.forEach((btn, i) => { btn.tabIndex = i === nextIndex ? 0 : -1; });
        buttons[nextIndex].focus();
      }
    }
  }, []);

  const handleLegacyKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = COLOR_PRESETS.length;
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % count;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + count) % count;
    else if (e.key === 'ArrowDown') nextIndex = Math.min(index + COLS, count - 1);
    else if (e.key === 'ArrowUp') nextIndex = Math.max(index - COLS, 0);

    if (nextIndex !== null) {
      e.preventDefault();
      const buttons = legacyRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      if (buttons?.[nextIndex]) {
        buttons.forEach((btn, i) => { btn.tabIndex = i === nextIndex ? 0 : -1; });
        buttons[nextIndex].focus();
      }
    }
  }, []);

  const curatedActiveIndex = CURATED_THEMES.findIndex((t) => t.id === activeThemeId);
  const curatedTabbableIndex = curatedActiveIndex >= 0 ? curatedActiveIndex : 0;

  const legacyActiveIndex = !activeThemeId ? COLOR_PRESETS.findIndex((p) => p.name === activePreset) : -1;
  const legacyTabbableIndex = legacyActiveIndex >= 0 ? legacyActiveIndex : 0;

  function handleCuratedClick(theme: Theme) {
    if (!canApplyTheme(theme, userTier)) {
      onPremiumBlocked();
      return;
    }
    onCuratedThemeSelect(theme);
  }

  return (
    <div>
      {/* Curated themes: primary 5-column radiogroup */}
      <div ref={curatedRef} className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="ערכות נושא">
        {CURATED_THEMES.map((theme, index) => {
          const isActive = theme.id === activeThemeId;
          const isPremiumLocked = !canApplyTheme(theme, userTier);
          return (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`${theme.hebrewName}${isPremiumLocked ? ' (פרימיום)' : ''}`}
              title={theme.hebrewName}
              tabIndex={index === curatedTabbableIndex ? 0 : -1}
              onClick={() => handleCuratedClick(theme)}
              onKeyDown={(e) => handleCuratedKeyDown(e, index)}
              style={{ background: getPresetGradient(theme.colors), boxShadow: 'var(--shadow-1)' }}
              className={[
                'marko-preset-circle relative',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                isActive
                  ? 'border-2 border-[var(--primary)]'
                  : 'border-2 border-transparent motion-safe:hover:scale-110',
                'motion-safe:active:scale-95',
              ].join(' ')}
            >
              {isPremiumLocked && (
                <Lock
                  className="absolute bottom-0 end-0 size-2.5 rounded-full bg-[var(--surface)] text-[var(--foreground-muted)]"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legacy presets: collapsible section */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowLegacy((v) => !v)}
          className="flex w-full items-center gap-1 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          style={{ fontSize: 'var(--text-caption)' }}
          aria-expanded={showLegacy}
          aria-label="נושאים נוספים"
        >
          <ChevronDown
            className={`size-3.5 transition-transform ${showLegacy ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
          <span className="font-medium">נושאים נוספים</span>
        </button>

        {showLegacy && (
          <div ref={legacyRef} className="mt-2 grid grid-cols-5 gap-2" role="radiogroup" aria-label="נושאי צבע קלאסיים">
            {COLOR_PRESETS.map((preset, index) => {
              const isActive = preset.name === activePreset && !activeThemeId;
              return (
                <button
                  key={preset.name}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  aria-label={preset.hebrewName}
                  title={preset.hebrewName}
                  tabIndex={index === legacyTabbableIndex ? 0 : -1}
                  onClick={() => onPresetSelect(preset.name, preset.theme)}
                  onKeyDown={(e) => handleLegacyKeyDown(e, index)}
                  style={{ background: getPresetGradient(preset.theme), boxShadow: 'var(--shadow-1)' }}
                  className={[
                    'marko-preset-circle',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                    isActive
                      ? 'border-2 border-[var(--primary)]'
                      : 'border-2 border-transparent motion-safe:hover:scale-110',
                    'motion-safe:active:scale-95',
                  ].join(' ')}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Custom presets: list rows with swatch, name, delete */}
      {customPresets.length > 0 && (
        <div className="mt-3" role="group" aria-label="נושאים מותאמים אישית">
          <h4 className="mb-1.5 font-medium text-[var(--foreground-muted)]" style={{ fontSize: 'var(--text-caption)' }}>נושאים שלי</h4>
          <div className="space-y-1">
            {customPresets.map((preset, index) => (
              <div key={`${preset.name}-${index}`} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onCustomPresetSelect(preset.colors)}
                  style={{ background: getPresetGradient(preset.colors), boxShadow: 'var(--shadow-1)' }}
                  className="h-7 w-7 flex-shrink-0 rounded-full transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 motion-safe:hover:scale-110 motion-safe:active:scale-95"
                  aria-hidden="true"
                  tabIndex={-1}
                  title={preset.name}
                />
                <button
                  type="button"
                  onClick={() => onCustomPresetSelect(preset.colors)}
                  className="flex-1 truncate text-start text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors focus-visible:outline-none focus-visible:underline"
                  style={{ fontSize: 'var(--text-body-sm)' }}
                  aria-label={`הפעל נושא ${preset.name}`}
                >
                  {preset.name}
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCustomPreset(index)}
                  className="flex-shrink-0 rounded p-0.5 text-[var(--foreground-faint)] hover:text-[var(--destructive)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
