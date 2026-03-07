import { describe, it, expect, vi, afterEach } from 'vitest';
import { applyColorTheme } from './apply-colors';
import { DEFAULT_CLASSIC_THEME } from './defaults';

const EXPECTED_CSS_VARS: Record<string, string> = {
  primaryText: '--color-primary-text',
  secondaryText: '--color-secondary-text',
  link: '--color-link',
  code: '--color-code',
  h1: '--color-h1',
  h1Border: '--color-h1-border',
  h2: '--color-h2',
  h2Border: '--color-h2-border',
  h3: '--color-h3',
  previewBg: '--color-preview-bg',
  codeBg: '--color-code-bg',
  blockquoteBg: '--color-blockquote-bg',
  tableHeader: '--color-table-header',
  tableAlt: '--color-table-alt',
  blockquoteBorder: '--color-blockquote-border',
  hr: '--color-hr',
  tableBorder: '--color-table-border',
};

afterEach(() => {
  // Clean up any CSS custom properties set during tests
  Object.values(EXPECTED_CSS_VARS).forEach((varName) => {
    document.documentElement.style.removeProperty(varName);
  });
});

describe('applyColorTheme — CSS custom property mapping', () => {
  it('sets all 17 CSS custom properties on document.documentElement', () => {
    const spy = vi.spyOn(document.documentElement.style, 'setProperty');
    applyColorTheme(DEFAULT_CLASSIC_THEME);
    expect(spy).toHaveBeenCalledTimes(17);
    spy.mockRestore();
  });

  it('maps primaryText to --color-primary-text', () => {
    applyColorTheme(DEFAULT_CLASSIC_THEME);
    expect(document.documentElement.style.getPropertyValue('--color-primary-text')).toBe(
      DEFAULT_CLASSIC_THEME.primaryText
    );
  });

  it('maps h1 to --color-h1', () => {
    applyColorTheme(DEFAULT_CLASSIC_THEME);
    expect(document.documentElement.style.getPropertyValue('--color-h1')).toBe(
      DEFAULT_CLASSIC_THEME.h1
    );
  });

  it('maps previewBg to --color-preview-bg', () => {
    applyColorTheme(DEFAULT_CLASSIC_THEME);
    expect(document.documentElement.style.getPropertyValue('--color-preview-bg')).toBe(
      DEFAULT_CLASSIC_THEME.previewBg
    );
  });

  it('sets correct CSS variable names for all 17 properties', () => {
    const spy = vi.spyOn(document.documentElement.style, 'setProperty');
    applyColorTheme(DEFAULT_CLASSIC_THEME);

    const calledVars = spy.mock.calls.map((call) => call[0]);
    Object.values(EXPECTED_CSS_VARS).forEach((cssVar) => {
      expect(calledVars).toContain(cssVar);
    });
    spy.mockRestore();
  });

  it('sets correct values matching the theme object', () => {
    applyColorTheme(DEFAULT_CLASSIC_THEME);
    expect(document.documentElement.style.getPropertyValue('--color-link')).toBe('#10B981');
    expect(document.documentElement.style.getPropertyValue('--color-h1-border')).toBe('#10B981');
    expect(document.documentElement.style.getPropertyValue('--color-code-bg')).toBe('#f8f8f8');
  });
});

describe('applyColorTheme — SSR guard', () => {
  it('returns without error when document is undefined', () => {
    const originalDocument = globalThis.document;
    // Simulate SSR by temporarily removing document
    Object.defineProperty(globalThis, 'document', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(() => applyColorTheme(DEFAULT_CLASSIC_THEME)).not.toThrow();

    Object.defineProperty(globalThis, 'document', {
      value: originalDocument,
      writable: true,
      configurable: true,
    });
  });
});
