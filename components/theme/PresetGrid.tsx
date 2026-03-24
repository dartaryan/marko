'use client';
import { useState, useRef, useCallback } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { COLOR_PRESETS } from '@/lib/colors/presets';
import { CURATED_THEMES, canApplyTheme } from '@/lib/colors/themes';
import { ThemeCard } from './ThemeCard';
import type { ColorTheme, CustomPreset, Theme } from '@/types/colors';

interface PresetGridProps {
  activePreset: string; // preset name or '' for custom
  activeThemeId: string; // curated theme ID or '' for none
  currentColors: ColorTheme; // current persisted colors (for Escape revert)
  userTier: 'free' | 'paid' | 'anonymous' | 'loading';
  onPresetSelect: (name: string, theme: ColorTheme) => void;
  onCuratedThemeSelect: (theme: Theme) => void;
  onPremiumBlocked: () => void;
  onPreview: (colors: ColorTheme) => void;
  customPresets: CustomPreset[];
  onCustomPresetSelect: (colors: ColorTheme) => void;
  onDeleteCustomPreset: (index: number) => void;
}

function ColorStrips({ colors }: { colors: ColorTheme }) {
  const strips = [colors.h1, colors.link, colors.codeBg];
  return (
    <span className="flex h-full w-full overflow-hidden" aria-hidden="true">
      {strips.map((color, i) => (
        <span key={i} className="flex-1" style={{ backgroundColor: color }} />
      ))}
    </span>
  );
}

const CURATED_COLS = 2;
const LEGACY_COLS = 5;

export function PresetGrid({
  activePreset,
  activeThemeId,
  currentColors,
  userTier,
  onPresetSelect,
  onCuratedThemeSelect,
  onPremiumBlocked,
  onPreview,
  customPresets,
  onCustomPresetSelect,
  onDeleteCustomPreset,
}: PresetGridProps) {
  const curatedRef = useRef<HTMLDivElement>(null);
  const legacyRef = useRef<HTMLDivElement>(null);
  const committedThemeRef = useRef<Theme | null>(null);
  const [showLegacy, setShowLegacy] = useState(false);

  // Track the committed theme (the theme that was last persisted via click/Enter)
  const curatedActiveIndex = CURATED_THEMES.findIndex((t) => t.id === activeThemeId);
  if (curatedActiveIndex >= 0 && committedThemeRef.current?.id !== activeThemeId) {
    committedThemeRef.current = CURATED_THEMES[curatedActiveIndex];
  }
  const curatedTabbableIndex = curatedActiveIndex >= 0 ? curatedActiveIndex : 0;

  const handleCuratedKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = CURATED_THEMES.length;
    let nextIndex: number | null = null;

    // RTL: ArrowRight = previous (index - 1), ArrowLeft = next (index + 1)
    if (e.key === 'ArrowRight') nextIndex = (index - 1 + count) % count;
    else if (e.key === 'ArrowLeft') nextIndex = (index + 1) % count;
    else if (e.key === 'ArrowDown') {
      const target = index + CURATED_COLS;
      if (target < count) nextIndex = target; // only move if a row below exists
    } else if (e.key === 'ArrowUp') {
      const target = index - CURATED_COLS;
      if (target >= 0) nextIndex = target; // only move if a row above exists
    }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const theme = CURATED_THEMES[index];
      if (!canApplyTheme(theme, userTier)) {
        onPremiumBlocked();
        return;
      }
      onCuratedThemeSelect(theme);
      committedThemeRef.current = theme;
      return;
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onPreview(committedThemeRef.current?.colors ?? currentColors);
      return;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const buttons = curatedRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      if (buttons?.[nextIndex]) {
        buttons.forEach((btn, i) => { btn.tabIndex = i === nextIndex ? 0 : -1; });
        buttons[nextIndex].focus();
        // Live preview on arrow-key navigation
        onPreview(CURATED_THEMES[nextIndex].colors);
      }
    }
  }, [userTier, onCuratedThemeSelect, onPremiumBlocked, onPreview, currentColors]);

  const handleLegacyKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = COLOR_PRESETS.length;
    let nextIndex: number | null = null;
    // RTL: ArrowRight = previous (index - 1), ArrowLeft = next (index + 1)
    if (e.key === 'ArrowRight') nextIndex = (index - 1 + count) % count;
    else if (e.key === 'ArrowLeft') nextIndex = (index + 1) % count;
    else if (e.key === 'ArrowDown') {
      const target = index + LEGACY_COLS;
      if (target < count) nextIndex = target;
    } else if (e.key === 'ArrowUp') {
      const target = index - LEGACY_COLS;
      if (target >= 0) nextIndex = target;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const buttons = legacyRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      if (buttons?.[nextIndex]) {
        buttons.forEach((btn, i) => { btn.tabIndex = i === nextIndex ? 0 : -1; });
        buttons[nextIndex].focus();
      }
    }
  }, []);

  const legacyActiveIndex = !activeThemeId ? COLOR_PRESETS.findIndex((p) => p.name === activePreset) : -1;
  const legacyTabbableIndex = legacyActiveIndex >= 0 ? legacyActiveIndex : 0;

  function handleCuratedClick(theme: Theme) {
    if (!canApplyTheme(theme, userTier)) {
      onPremiumBlocked();
      return;
    }
    onCuratedThemeSelect(theme);
    committedThemeRef.current = theme;
  }

  return (
    <div>
      {/* Curated themes: 2-column visual card grid */}
      <div ref={curatedRef} className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="ערכות נושא">
        {CURATED_THEMES.map((theme, index) => {
          const isActive = theme.id === activeThemeId;
          const isPremiumLocked = !canApplyTheme(theme, userTier);
          return (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={isActive}
              isPremiumLocked={isPremiumLocked}
              tabIndex={index === curatedTabbableIndex ? 0 : -1}
              onClick={() => handleCuratedClick(theme)}
              onKeyDown={(e) => handleCuratedKeyDown(e, index)}
            />
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
                  style={{ boxShadow: 'var(--shadow-1)' }}
                  className={[
                    'flex size-9 overflow-hidden rounded-md',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                    isActive
                      ? 'ring-2 ring-[var(--primary)] ring-offset-1'
                      : 'motion-safe:hover:scale-110',
                    'motion-safe:active:scale-95',
                  ].join(' ')}
                >
                  <ColorStrips colors={preset.theme} />
                </button>
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
                  style={{ boxShadow: 'var(--shadow-1)' }}
                  className="flex size-7 flex-shrink-0 overflow-hidden rounded-md transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 motion-safe:hover:scale-110 motion-safe:active:scale-95"
                  aria-hidden="true"
                  tabIndex={-1}
                  title={preset.name}
                >
                  <ColorStrips colors={preset.colors} />
                </button>
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
