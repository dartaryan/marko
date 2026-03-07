export const V1_KEYS = {
  content: 'mdEditorContent',
  colors: 'mdEditorColors',
  customPreset: 'mdEditorCustomPreset',
  lastVersion: 'mdEditorLastVersion',
} as const;

export const V2_KEYS = {
  content: 'marko-v2-editor-content',
  colorTheme: 'marko-v2-color-theme',
  customPresets: 'marko-v2-custom-presets',
} as const;

export function migrateV1Data(): void {
  if (typeof window === 'undefined') return;

  try {
    const v1Content = localStorage.getItem(V1_KEYS.content);
    const v1Colors = localStorage.getItem(V1_KEYS.colors);
    const v1Preset = localStorage.getItem(V1_KEYS.customPreset);
    const v1Version = localStorage.getItem(V1_KEYS.lastVersion);

    // No v1 data — silently return (idempotency guard)
    if (v1Content === null && v1Colors === null && v1Preset === null && v1Version === null) return;

    // Migrate content (raw string → JSON string), do not overwrite existing v2 data
    if (v1Content !== null && localStorage.getItem(V2_KEYS.content) === null) {
      localStorage.setItem(V2_KEYS.content, JSON.stringify(v1Content));
    }

    // Migrate colors (already JSON — copy as-is), do not overwrite existing v2 data
    if (v1Colors !== null && localStorage.getItem(V2_KEYS.colorTheme) === null) {
      localStorage.setItem(V2_KEYS.colorTheme, v1Colors);
    }

    // Migrate custom preset (wrap in named array for v2 multi-preset support)
    if (v1Preset !== null && localStorage.getItem(V2_KEYS.customPresets) === null) {
      try {
        const parsed = JSON.parse(v1Preset);
        const v2Format = [{ name: 'My Custom', colors: parsed }];
        localStorage.setItem(V2_KEYS.customPresets, JSON.stringify(v2Format));
      } catch {
        // Malformed preset — skip silently
      }
    }

    // Delete ALL v1 keys (including version — not migrated)
    Object.values(V1_KEYS).forEach((key) => localStorage.removeItem(key));
  } catch {
    // Entire migration failed silently — user gets fresh v2 experience
  }
}
