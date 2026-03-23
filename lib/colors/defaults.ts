import type { ColorTheme } from '@/types/colors';
import { CURATED_THEMES } from './themes';

export const DEFAULT_CLASSIC_THEME: ColorTheme = {
  primaryText: '#333333',
  secondaryText: '#666666',
  link: '#10B981',
  code: '#e83e8c',
  h1: '#065f46',
  h1Border: '#10B981',
  h2: '#047857',
  h2Border: '#34d399',
  h3: '#059669',
  previewBg: '#ffffff',
  codeBg: '#f8f8f8',
  blockquoteBg: '#f0fdf4',
  tableHeader: '#ecfdf5',
  tableAlt: '#f8fafb',
  blockquoteBorder: '#10B981',
  hr: '#d1d5db',
  tableBorder: '#d1d5db',
};

// Green Meadow — derived from CURATED_THEMES[0] (single source of truth)
export const DEFAULT_THEME: ColorTheme = CURATED_THEMES[0].colors;
