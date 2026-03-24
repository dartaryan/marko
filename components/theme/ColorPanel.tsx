'use client';
import { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ColorPicker } from './ColorPicker';
import { PresetGrid } from './PresetGrid';
import { ImageColorExtractor } from './ImageColorExtractor';
import { Palette, Paintbrush, ImagePlus } from 'lucide-react';
import { DEFAULT_THEME } from '@/lib/colors/defaults';
import { CURATED_THEME_MAP, DEFAULT_THEME_ID } from '@/lib/colors/themes';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { useThemeSelection, ACTIVE_THEME_KEY } from '@/lib/hooks/useThemeSelection';
import { useCustomPresets } from '@/lib/hooks/useCustomPresets';
import { toast } from 'sonner';
import type { ColorTheme, Theme } from '@/types/colors';

// Exported so Story 2.3 can use the same key for custom preset persistence
export const ACTIVE_PRESET_KEY = 'marko-v2-active-preset';
// Re-export for tests
export { ACTIVE_THEME_KEY };

interface ColorPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  theme: ColorTheme;
  onThemeChange: (theme: ColorTheme) => void;
  onThemePreview?: (theme: ColorTheme) => void;
  userTier: 'free' | 'paid' | 'anonymous' | 'loading';
}

const HEBREW_LABELS: Record<keyof ColorTheme, string> = {
  primaryText: 'טקסט ראשי',
  secondaryText: 'טקסט משני',
  link: 'קישורים',
  code: 'קוד מוטבע',
  h1: 'כותרת 1',
  h1Border: 'גבול כותרת 1',
  h2: 'כותרת 2',
  h2Border: 'גבול כותרת 2',
  h3: 'כותרת 3',
  previewBg: 'רקע תצוגה מקדימה',
  codeBg: 'רקע קוד',
  blockquoteBg: 'רקע ציטוט',
  tableHeader: 'כותרת טבלה',
  tableAlt: 'שורת טבלה חלופית',
  blockquoteBorder: 'גבול ציטוט',
  hr: 'קו הפרדה',
  tableBorder: 'גבול טבלה',
};

const SECTIONS: { title: string; keys: (keyof ColorTheme)[] }[] = [
  { title: 'טקסט', keys: ['primaryText', 'secondaryText', 'link', 'code'] },
  { title: 'כותרות', keys: ['h1', 'h1Border', 'h2', 'h2Border', 'h3'] },
  { title: 'רקעים', keys: ['previewBg', 'codeBg', 'blockquoteBg', 'tableHeader', 'tableAlt'] },
  { title: 'מבטאים', keys: ['blockquoteBorder', 'hr', 'tableBorder'] },
];

export function ColorPanel({ isOpen, onOpenChange, theme, onThemeChange, onThemePreview, userTier }: ColorPanelProps) {
  const [activePreset, setActivePreset] = useLocalStorage<string>(ACTIVE_PRESET_KEY, '');
  const { activeThemeId, setActiveThemeId } = useThemeSelection();
  const { customPresets, savePreset, deletePreset } = useCustomPresets();
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [draftPresetName, setDraftPresetName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSavingPreset) {
      nameInputRef.current?.focus();
    }
  }, [isSavingPreset]);

  function handleColorChange(key: keyof ColorTheme, value: string) {
    onThemeChange({ ...theme, [key]: value });
    setActivePreset('');
    setActiveThemeId(''); // manual edit = custom
  }

  function handleCuratedThemeSelect(t: Theme) {
    onThemeChange(t.colors);
    setActiveThemeId(t.id);
    setActivePreset(''); // clear legacy active
  }

  function handleLegacyPresetSelect(name: string, presetTheme: ColorTheme) {
    onThemeChange(presetTheme);
    setActivePreset(name);
    setActiveThemeId(''); // clear curated active
  }

  function handlePreview(colors: ColorTheme) {
    // Apply CSS vars visually without persisting to localStorage
    if (onThemePreview) {
      onThemePreview(colors);
    } else {
      onThemeChange(colors);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open && onThemePreview) {
      // Revert any uncommitted preview when closing the panel
      onThemePreview(theme);
    }
    onOpenChange(open);
  }

  function handlePremiumBlocked() {
    toast('ערכת נושא פרימיום — זמינה עם מנוי');
  }

  function handleSavePreset() {
    const trimmed = draftPresetName.trim();
    if (!trimmed) return;
    savePreset(trimmed, theme);
    setDraftPresetName('');
    setIsSavingPreset(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-80 overflow-y-auto border-s border-[var(--border)]"
        style={{
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-3)',
          direction: 'rtl',
        }}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-1.5 text-[var(--foreground)]" style={{ fontSize: 'var(--text-h4)', fontWeight: 700 }}><Palette className="size-4" aria-hidden="true" />ערכות נושא</SheetTitle>
          <SheetDescription className="text-[var(--foreground-muted)]" style={{ fontSize: 'var(--text-body-sm)' }}>בחר ערכת נושא או התאם צבעים ידנית</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-6 pb-6" style={{ padding: '0 16px 24px' }}>
          {/* Preset selection grid + custom presets + save form */}
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 font-semibold text-[var(--foreground-muted)]" style={{ fontSize: 'var(--text-body-sm)' }}><Palette className="size-3.5" aria-hidden="true" />נושא</h3>
            <PresetGrid
              activePreset={activePreset}
              activeThemeId={activeThemeId}
              currentColors={theme}
              userTier={userTier}
              onPresetSelect={handleLegacyPresetSelect}
              onCuratedThemeSelect={handleCuratedThemeSelect}
              onPremiumBlocked={handlePremiumBlocked}
              onPreview={handlePreview}
              customPresets={customPresets}
              onCustomPresetSelect={(colors) => {
                onThemeChange(colors);
                setActivePreset('');
                setActiveThemeId(''); // clear curated
              }}
              onDeleteCustomPreset={deletePreset}
            />

            {/* Save current colors as named custom preset */}
            <div className="mt-2">
              {isSavingPreset ? (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={draftPresetName}
                    onChange={(e) => setDraftPresetName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSavePreset();
                      if (e.key === 'Escape') {
                        setIsSavingPreset(false);
                        setDraftPresetName('');
                      }
                    }}
                    ref={nameInputRef}
                    placeholder="שם הנושא..."
                    dir="auto"
                    className="marko-panel-input w-full"
                    aria-label="שם הנושא החדש"
                  />
                  <div className="flex gap-1.5 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSavingPreset(false);
                        setDraftPresetName('');
                      }}
                      className="marko-panel-btn-sm"
                      aria-label="ביטול שמירת נושא"
                    >
                      ביטול
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePreset}
                      disabled={!draftPresetName.trim()}
                      className="marko-panel-btn-sm"
                      aria-label="שמור נושא"
                    >
                      שמור
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSavingPreset(true)}
                  className="marko-panel-btn-full"
                  aria-label="שמור צבעים נוכחיים כנושא מותאם אישית"
                >
                  שמור נושא נוכחי...
                </button>
              )}
            </div>
          </div>

          {/* Image extraction */}
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 font-semibold text-[var(--foreground-muted)]" style={{ fontSize: 'var(--text-body-sm)' }}><ImagePlus className="size-3.5" aria-hidden="true" />חילוץ מתמונה</h3>
            <ImageColorExtractor
              onApply={(extractedTheme) => {
                onThemeChange(extractedTheme);
                setActivePreset('');
                setActiveThemeId('');
              }}
            />
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 flex items-center gap-1.5 font-semibold text-[var(--foreground-muted)]" style={{ fontSize: 'var(--text-body-sm)' }}>
                <Paintbrush className="size-3.5" aria-hidden="true" />{section.title}
              </h3>
              <div className="space-y-2">
                {section.keys.map((key) => (
                  <ColorPicker
                    key={key}
                    label={HEBREW_LABELS[key]}
                    value={theme[key]}
                    onChange={(value) => handleColorChange(key, value)}
                  />
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const greenMeadow = CURATED_THEME_MAP[DEFAULT_THEME_ID];
              onThemeChange(greenMeadow ? greenMeadow.colors : DEFAULT_THEME);
              setActiveThemeId(DEFAULT_THEME_ID);
              setActivePreset('');
            }}
            className="marko-panel-btn-reset"
          >
            איפוס לברירת מחדל
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
