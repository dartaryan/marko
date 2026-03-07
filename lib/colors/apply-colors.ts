import type { ColorTheme } from '@/types/colors';

const CSS_VAR_MAP: Record<keyof ColorTheme, string> = {
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

export function applyColorTheme(theme: ColorTheme): void {
  if (typeof document === 'undefined') return; // SSR guard
  const root = document.documentElement;
  (Object.keys(CSS_VAR_MAP) as Array<keyof ColorTheme>).forEach((key) => {
    root.style.setProperty(CSS_VAR_MAP[key], theme[key]);
  });
}
