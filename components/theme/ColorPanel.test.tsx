import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { ColorPanel, ACTIVE_PRESET_KEY, ACTIVE_THEME_KEY } from './ColorPanel';
import { CUSTOM_PRESETS_KEY } from '@/lib/hooks/useCustomPresets';
import { DEFAULT_CLASSIC_THEME, DEFAULT_THEME } from '@/lib/colors/defaults';
import { COLOR_PRESETS } from '@/lib/colors/presets';
import { CURATED_THEMES } from '@/lib/colors/themes';
import type { ColorTheme } from '@/types/colors';

const SAMPLE_THEME: ColorTheme = { ...DEFAULT_CLASSIC_THEME };

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  localStorage.clear();
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  document.body.removeChild(container);
});

function renderColorPanel(props: Partial<React.ComponentProps<typeof ColorPanel>> = {}) {
  const defaults = {
    isOpen: true,
    onOpenChange: vi.fn(),
    theme: SAMPLE_THEME,
    onThemeChange: vi.fn(),
    userTier: 'free' as const,
  };
  const merged = { ...defaults, ...props };
  act(() => {
    root = createRoot(container);
    root.render(<ColorPanel {...merged} />);
  });
  return merged;
}

// ─── Hebrew Section Headers ──────────────────────────────────────────────────

describe('ColorPanel — Hebrew section headers', () => {
  it('renders "🖌 טקסט" section header', () => {
    renderColorPanel();
    const headers = Array.from(document.body.querySelectorAll('h3')).map((h) => h.textContent);
    expect(headers).toContain('🖌 טקסט');
  });

  it('renders "🖌 כותרות" section header', () => {
    renderColorPanel();
    const headers = Array.from(document.body.querySelectorAll('h3')).map((h) => h.textContent);
    expect(headers).toContain('🖌 כותרות');
  });

  it('renders "🖌 רקעים" section header', () => {
    renderColorPanel();
    const headers = Array.from(document.body.querySelectorAll('h3')).map((h) => h.textContent);
    expect(headers).toContain('🖌 רקעים');
  });

  it('renders "🖌 מבטאים" section header', () => {
    renderColorPanel();
    const headers = Array.from(document.body.querySelectorAll('h3')).map((h) => h.textContent);
    expect(headers).toContain('🖌 מבטאים');
  });

  it('renders exactly 4 section headers', () => {
    renderColorPanel();
    // Filter h3 elements that are section headers (not SheetTitle h3)
    const sectionHeaders = Array.from(document.body.querySelectorAll('h3')).filter((h) =>
      ['🖌 טקסט', '🖌 כותרות', '🖌 רקעים', '🖌 מבטאים'].includes(h.textContent ?? '')
    );
    expect(sectionHeaders).toHaveLength(4);
  });
});

// ─── Color Picker Count ──────────────────────────────────────────────────────

describe('ColorPanel — color picker count', () => {
  it('renders exactly 17 color inputs', () => {
    renderColorPanel();
    const colorInputs = document.body.querySelectorAll('input[type="color"]');
    expect(colorInputs).toHaveLength(17);
  });

  it('renders exactly 17 hex text inputs', () => {
    renderColorPanel();
    const textInputs = document.body.querySelectorAll('input[type="text"]');
    expect(textInputs).toHaveLength(17);
  });
});

// ─── Color Change ────────────────────────────────────────────────────────────

describe('ColorPanel — color change', () => {
  it('calls onThemeChange with merged theme when first color picker changes', () => {
    const onThemeChange = vi.fn();
    renderColorPanel({ onThemeChange });

    const firstColorInput = document.body.querySelector('input[type="color"]') as HTMLInputElement;
    expect(firstColorInput).not.toBeNull();

    act(() => {
      Object.defineProperty(firstColorInput, 'value', {
        writable: true,
        value: '#FF0000',
      });
      firstColorInput.dispatchEvent(new Event('input', { bubbles: true }));
      firstColorInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(onThemeChange).toHaveBeenCalled();
    const call = onThemeChange.mock.calls[0][0] as ColorTheme;
    // Should be a complete ColorTheme object with all 17 properties
    expect(Object.keys(call)).toHaveLength(17);
  });
});

// ─── Reset Button ────────────────────────────────────────────────────────────

describe('ColorPanel — reset button', () => {
  it('renders reset button with Hebrew label "איפוס לברירת מחדל"', () => {
    renderColorPanel();
    const buttons = Array.from(document.body.querySelectorAll('button'));
    const resetButton = buttons.find((btn) => btn.textContent?.trim() === 'איפוס לברירת מחדל');
    expect(resetButton).toBeDefined();
  });

  it('calls onThemeChange with Green Meadow (DEFAULT_THEME) when reset button is clicked', () => {
    const onThemeChange = vi.fn();
    const customTheme: ColorTheme = { ...SAMPLE_THEME, primaryText: '#FF0000' };
    renderColorPanel({ theme: customTheme, onThemeChange });

    const buttons = Array.from(document.body.querySelectorAll('button'));
    const resetButton = buttons.find((btn) => btn.textContent?.trim() === 'איפוס לברירת מחדל');
    expect(resetButton).toBeDefined();

    act(() => {
      resetButton!.click();
    });

    expect(onThemeChange).toHaveBeenCalledWith(DEFAULT_THEME);
  });
});

// ─── Preset Grid ─────────────────────────────────────────────────────────────

describe('ColorPanel — curated theme grid', () => {
  it('renders 8 curated theme buttons in the primary radiogroup', () => {
    renderColorPanel();
    const curatedButtons = document.body.querySelectorAll('[role="radiogroup"][aria-label="ערכות נושא"] [role="radio"]');
    expect(curatedButtons).toHaveLength(8);
  });

  it('calls onThemeChange with Sea of Galilee theme when its button is clicked', () => {
    const onThemeChange = vi.fn();
    renderColorPanel({ onThemeChange });

    const seaTheme = CURATED_THEMES.find((t) => t.id === 'sea-of-galilee')!;
    const seaButton = document.body.querySelector(
      `button[title="${seaTheme.hebrewName}"]`
    ) as HTMLButtonElement;
    expect(seaButton).not.toBeNull();

    act(() => {
      seaButton.click();
    });

    expect(onThemeChange).toHaveBeenCalledWith(seaTheme.colors);
  });

  it('shows active state on the curated theme matching stored active-theme ID', () => {
    localStorage.setItem(ACTIVE_THEME_KEY, JSON.stringify('sea-of-galilee'));
    renderColorPanel();

    const seaTheme = CURATED_THEMES.find((t) => t.id === 'sea-of-galilee')!;
    const seaButton = document.body.querySelector(
      `button[title="${seaTheme.hebrewName}"]`
    ) as HTMLButtonElement;
    expect(seaButton.getAttribute('aria-checked')).toBe('true');
  });

  it('clears active curated theme when an individual color picker is changed', () => {
    localStorage.setItem(ACTIVE_THEME_KEY, JSON.stringify('sea-of-galilee'));
    renderColorPanel();

    const seaTheme = CURATED_THEMES.find((t) => t.id === 'sea-of-galilee')!;
    const seaButton = document.body.querySelector(
      `button[title="${seaTheme.hebrewName}"]`
    ) as HTMLButtonElement;
    expect(seaButton.getAttribute('aria-checked')).toBe('true');

    const firstColorInput = document.body.querySelector('input[type="color"]') as HTMLInputElement;
    act(() => {
      Object.defineProperty(firstColorInput, 'value', { writable: true, value: '#FF0000' });
      firstColorInput.dispatchEvent(new Event('input', { bubbles: true }));
      firstColorInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(seaButton.getAttribute('aria-checked')).toBe('false');
  });

  it('renders "נושאים נוספים" collapsible section for legacy presets', () => {
    renderColorPanel();
    const buttons = Array.from(document.body.querySelectorAll('button'));
    const legacyToggle = buttons.find((b) => b.textContent?.includes('נושאים נוספים'));
    expect(legacyToggle).toBeDefined();
  });
});

// ─── Custom Presets (Story 2.3) ───────────────────────────────────────────────

// Helper to simulate typing in a controlled text input
function setInputValue(input: HTMLInputElement, value: string) {
  const nativeInputSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )!.set!;
  nativeInputSetter.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('ColorPanel — custom presets', () => {
  // 5.1: save button renders
  it('renders "שמור נושא נוכחי..." button', () => {
    renderColorPanel();
    const buttons = Array.from(document.body.querySelectorAll('button'));
    const saveBtn = buttons.find((b) => b.textContent?.trim() === 'שמור נושא נוכחי...');
    expect(saveBtn).toBeDefined();
  });

  // 5.2: clicking save button reveals name input
  it('clicking save preset button shows name input with save and cancel buttons', () => {
    renderColorPanel();
    const saveBtn = Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'שמור נושא נוכחי...'
    )!;
    act(() => { saveBtn.click(); });

    const input = document.body.querySelector('input[placeholder="שם הנושא..."]');
    expect(input).not.toBeNull();

    const allButtons = Array.from(document.body.querySelectorAll('button'));
    const confirmBtn = allButtons.find((b) => b.getAttribute('aria-label') === 'שמור נושא');
    const cancelBtn = allButtons.find((b) => b.getAttribute('aria-label') === 'ביטול שמירת נושא');
    expect(confirmBtn).toBeDefined();
    expect(cancelBtn).toBeDefined();
  });

  // 5.3: entering a name and clicking "שמור" saves to localStorage
  it('saves preset with valid name to localStorage', () => {
    renderColorPanel();
    act(() => {
      const saveBtn = Array.from(document.body.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'שמור נושא נוכחי...'
      )!;
      saveBtn.click();
    });

    const input = document.body.querySelector(
      'input[placeholder="שם הנושא..."]'
    ) as HTMLInputElement;
    act(() => { setInputValue(input, 'Green Theme'); });

    const confirmBtn = Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.getAttribute('aria-label') === 'שמור נושא'
    ) as HTMLButtonElement;
    act(() => { confirmBtn.click(); });

    const saved = JSON.parse(localStorage.getItem(CUSTOM_PRESETS_KEY) ?? '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe('Green Theme');
    expect(saved[0].colors).toMatchObject({ h1: DEFAULT_CLASSIC_THEME.h1 });
  });

  // 5.4: clicking "שמור" with empty name does NOT save
  it('confirm button is disabled when name is empty or whitespace only', () => {
    renderColorPanel();
    act(() => {
      const saveBtn = Array.from(document.body.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'שמור נושא נוכחי...'
      )!;
      saveBtn.click();
    });

    const confirmBtn = Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.getAttribute('aria-label') === 'שמור נושא'
    ) as HTMLButtonElement;
    // Initially disabled (empty name)
    expect(confirmBtn.disabled).toBe(true);

    const input = document.body.querySelector(
      'input[placeholder="שם הנושא..."]'
    ) as HTMLInputElement;
    act(() => { setInputValue(input, '   '); });
    // Whitespace-only still disabled
    expect(confirmBtn.disabled).toBe(true);
    expect(localStorage.getItem(CUSTOM_PRESETS_KEY)).toBeNull();
  });

  // 5.5: existing custom preset renders name text in panel
  it('renders saved custom preset name in panel', () => {
    localStorage.setItem(
      CUSTOM_PRESETS_KEY,
      JSON.stringify([{ name: 'Mine', colors: DEFAULT_CLASSIC_THEME }])
    );
    renderColorPanel();
    const buttons = Array.from(document.body.querySelectorAll('button'));
    const mineBtn = buttons.find((b) => b.textContent?.trim() === 'Mine');
    expect(mineBtn).toBeDefined();
  });

  // 5.6: clicking delete button removes preset from localStorage
  it('deletes custom preset when × button clicked', () => {
    localStorage.setItem(
      CUSTOM_PRESETS_KEY,
      JSON.stringify([{ name: 'Mine', colors: DEFAULT_CLASSIC_THEME }])
    );
    renderColorPanel();
    const deleteBtn = document.body.querySelector(
      'button[aria-label="מחק נושא Mine"]'
    ) as HTMLButtonElement;
    expect(deleteBtn).not.toBeNull();
    act(() => { deleteBtn.click(); });
    const saved = JSON.parse(localStorage.getItem(CUSTOM_PRESETS_KEY) ?? '[]');
    expect(saved).toHaveLength(0);
  });

  // 5.7: clicking custom preset swatch/name calls onThemeChange with stored colors
  it('applying custom preset calls onThemeChange with stored colors', () => {
    const onThemeChange = vi.fn();
    const customColors: ColorTheme = { ...DEFAULT_CLASSIC_THEME, h1: '#FF0000' };
    localStorage.setItem(
      CUSTOM_PRESETS_KEY,
      JSON.stringify([{ name: 'Mine', colors: customColors }])
    );
    renderColorPanel({ onThemeChange });
    const applyBtn = document.body.querySelector(
      'button[aria-label="הפעל נושא Mine"]'
    ) as HTMLButtonElement;
    expect(applyBtn).not.toBeNull();
    act(() => { applyBtn.click(); });
    expect(onThemeChange).toHaveBeenCalledWith(customColors);
  });

  // 5.8: v1-migrated format renders correctly
  it('renders v1-migrated preset (marko-v2-custom-presets format)', () => {
    const migrated = [{ name: 'My Custom', colors: DEFAULT_CLASSIC_THEME }];
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(migrated));
    renderColorPanel();
    const buttons = Array.from(document.body.querySelectorAll('button'));
    const myCustomBtn = buttons.find((b) => b.textContent?.trim() === 'My Custom');
    expect(myCustomBtn).toBeDefined();
  });

  // AC8: Enter key saves preset
  it('pressing Enter in name input saves the preset', () => {
    renderColorPanel();
    act(() => {
      const saveBtn = Array.from(document.body.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'שמור נושא נוכחי...'
      )!;
      saveBtn.click();
    });

    const input = document.body.querySelector(
      'input[placeholder="שם הנושא..."]'
    ) as HTMLInputElement;
    act(() => { setInputValue(input, 'Quick Save'); });
    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });

    const saved = JSON.parse(localStorage.getItem(CUSTOM_PRESETS_KEY) ?? '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe('Quick Save');
  });

  // AC8: Escape key cancels form
  it('pressing Escape in name input cancels the form', () => {
    renderColorPanel();
    act(() => {
      const saveBtn = Array.from(document.body.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'שמור נושא נוכחי...'
      )!;
      saveBtn.click();
    });

    expect(document.body.querySelector('input[placeholder="שם הנושא..."]')).not.toBeNull();

    const input = document.body.querySelector(
      'input[placeholder="שם הנושא..."]'
    ) as HTMLInputElement;
    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });

    expect(document.body.querySelector('input[placeholder="שם הנושא..."]')).toBeNull();
    const saveBtn = Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'שמור נושא נוכחי...'
    );
    expect(saveBtn).toBeDefined();
  });

  // M4: Cancel button closes form
  it('clicking cancel button closes the save form and restores save button', () => {
    renderColorPanel();
    act(() => {
      const saveBtn = Array.from(document.body.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'שמור נושא נוכחי...'
      )!;
      saveBtn.click();
    });

    expect(document.body.querySelector('input[placeholder="שם הנושא..."]')).not.toBeNull();

    const cancelBtn = Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.getAttribute('aria-label') === 'ביטול שמירת נושא'
    ) as HTMLButtonElement;
    act(() => { cancelBtn.click(); });

    expect(document.body.querySelector('input[placeholder="שם הנושא..."]')).toBeNull();
    const saveBtn = Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'שמור נושא נוכחי...'
    );
    expect(saveBtn).toBeDefined();
  });

  // L2: "נושאים שלי" heading renders when presets exist (AC2)
  it('renders "נושאים שלי" heading when custom presets exist', () => {
    localStorage.setItem(
      CUSTOM_PRESETS_KEY,
      JSON.stringify([{ name: 'Mine', colors: DEFAULT_CLASSIC_THEME }])
    );
    renderColorPanel();
    const headings = Array.from(document.body.querySelectorAll('h4'));
    const myThemesHeading = headings.find((h) => h.textContent?.trim() === 'נושאים שלי');
    expect(myThemesHeading).toBeDefined();
  });
});

// ─── Image Color Extraction (Story 2.4) ──────────────────────────────────────

describe('ColorPanel — image color extraction (Story 2.4)', () => {
  it('renders "העלה תמונה" button in the open color panel', () => {
    renderColorPanel();
    const buttons = Array.from(document.body.querySelectorAll('button'));
    const uploadBtn = buttons.find((b) => b.getAttribute('aria-label') === 'העלה תמונה לחילוץ צבעים');
    expect(uploadBtn).toBeDefined();
  });

  it('has a hidden file input that accepts image/* files', () => {
    renderColorPanel();
    const fileInput = document.body.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();
    expect(fileInput.accept).toBe('image/*');
  });
});
