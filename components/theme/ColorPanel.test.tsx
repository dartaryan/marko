import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { ColorPanel } from './ColorPanel';
import { DEFAULT_CLASSIC_THEME } from '@/lib/colors/defaults';
import type { ColorTheme } from '@/types/colors';

const SAMPLE_THEME: ColorTheme = { ...DEFAULT_CLASSIC_THEME };

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
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
  it('renders "טקסט" section header', () => {
    renderColorPanel();
    const headers = Array.from(document.body.querySelectorAll('h3')).map((h) => h.textContent);
    expect(headers).toContain('טקסט');
  });

  it('renders "כותרות" section header', () => {
    renderColorPanel();
    const headers = Array.from(document.body.querySelectorAll('h3')).map((h) => h.textContent);
    expect(headers).toContain('כותרות');
  });

  it('renders "רקעים" section header', () => {
    renderColorPanel();
    const headers = Array.from(document.body.querySelectorAll('h3')).map((h) => h.textContent);
    expect(headers).toContain('רקעים');
  });

  it('renders "מבטאים" section header', () => {
    renderColorPanel();
    const headers = Array.from(document.body.querySelectorAll('h3')).map((h) => h.textContent);
    expect(headers).toContain('מבטאים');
  });

  it('renders exactly 4 section headers', () => {
    renderColorPanel();
    // Filter h3 elements that are section headers (not SheetTitle h3)
    const sectionHeaders = Array.from(document.body.querySelectorAll('h3')).filter((h) =>
      ['טקסט', 'כותרות', 'רקעים', 'מבטאים'].includes(h.textContent ?? '')
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

  it('calls onThemeChange with DEFAULT_CLASSIC_THEME when reset button is clicked', () => {
    const onThemeChange = vi.fn();
    const customTheme: ColorTheme = { ...SAMPLE_THEME, primaryText: '#FF0000' };
    renderColorPanel({ theme: customTheme, onThemeChange });

    const buttons = Array.from(document.body.querySelectorAll('button'));
    const resetButton = buttons.find((btn) => btn.textContent?.trim() === 'איפוס לברירת מחדל');
    expect(resetButton).toBeDefined();

    act(() => {
      resetButton!.click();
    });

    expect(onThemeChange).toHaveBeenCalledWith(DEFAULT_CLASSIC_THEME);
  });
});
