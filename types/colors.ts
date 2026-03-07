export interface ColorTheme {
  // Text (4)
  primaryText: string;
  secondaryText: string;
  link: string;
  code: string;
  // Headings (5)
  h1: string;
  h1Border: string;
  h2: string;
  h2Border: string;
  h3: string;
  // Backgrounds (5)
  previewBg: string;
  codeBg: string;
  blockquoteBg: string;
  tableHeader: string;
  tableAlt: string;
  // Accents (3)
  blockquoteBorder: string;
  hr: string;
  tableBorder: string;
}

export interface ColorPreset {
  name: string;
  hebrewName: string;
  theme: ColorTheme;
}

export interface CustomPreset {
  name: string;
  colors: ColorTheme; // MUST be 'colors' — matches V2_KEYS.customPresets migration format
}
