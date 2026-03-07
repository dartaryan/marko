'use client';
import { useLocalStorage } from './useLocalStorage';
import type { ColorTheme, CustomPreset } from '@/types/colors';

// MUST match V2_KEYS.customPresets in lib/migration/v1-migration.ts
export const CUSTOM_PRESETS_KEY = 'marko-v2-custom-presets';

export function useCustomPresets() {
  const [customPresets, setCustomPresets] = useLocalStorage<CustomPreset[]>(
    CUSTOM_PRESETS_KEY,
    []
  );

  function savePreset(name: string, colors: ColorTheme): void {
    setCustomPresets((prev) => [...prev, { name, colors }]);
  }

  function deletePreset(index: number): void {
    setCustomPresets((prev) => prev.filter((_, i) => i !== index));
  }

  return { customPresets, savePreset, deletePreset };
}
