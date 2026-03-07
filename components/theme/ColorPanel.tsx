'use client';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ColorPicker } from './ColorPicker';
import { PresetGrid } from './PresetGrid';
import { DEFAULT_CLASSIC_THEME } from '@/lib/colors/defaults';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import type { ColorTheme } from '@/types/colors';

// Exported so Story 2.3 can use the same key for custom preset persistence
export const ACTIVE_PRESET_KEY = 'marko-v2-active-preset';

interface ColorPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  theme: ColorTheme;
  onThemeChange: (theme: ColorTheme) => void;
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

export function ColorPanel({ isOpen, onOpenChange, theme, onThemeChange }: ColorPanelProps) {
  const [activePreset, setActivePreset] = useLocalStorage<string>(ACTIVE_PRESET_KEY, 'classic');

  function handleColorChange(key: keyof ColorTheme, value: string) {
    onThemeChange({ ...theme, [key]: value });
    setActivePreset(''); // manual edit = custom theme
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-80 overflow-y-auto data-[state=open]:duration-200 data-[state=closed]:duration-200"
      >
        <SheetHeader>
          <SheetTitle>הגדרות צבע</SheetTitle>
          <SheetDescription>התאם את צבעי מסמך התצוגה המקדימה</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-6 pb-6">
          {/* Preset selection grid */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">נושא</h3>
            <PresetGrid
              activePreset={activePreset}
              onPresetSelect={(name, presetTheme) => {
                onThemeChange(presetTheme);
                setActivePreset(name);
              }}
            />
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                {section.title}
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
              onThemeChange(DEFAULT_CLASSIC_THEME);
              setActivePreset('classic');
            }}
            className="w-full rounded border border-border px-3 py-2 text-sm
                       text-muted-foreground hover:bg-muted motion-safe:active:scale-[0.98] transition-colors transition-transform"
          >
            איפוס לברירת מחדל
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
