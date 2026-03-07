import { describe, it, expect, beforeEach, vi } from 'vitest';
import { migrateV1Data, V1_KEYS, V2_KEYS } from './v1-migration';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: () => { store = {}; },
    get store() { return store; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

const SAMPLE_COLORS = JSON.stringify({
  primaryText: '#064E3B',
  secondaryText: '#047857',
  link: '#10B981',
  code: '#10B981',
  h1: '#064E3B',
  h1Border: '#10B981',
  h2: '#064E3B',
  h2Border: '#6EE7B7',
  h3: '#047857',
  previewBg: '#FFFFFF',
  codeBg: '#0d1117',
  blockquoteBg: '#F0FDF4',
  tableHeader: '#10B981',
  tableAlt: '#F0FDF4',
  blockquoteBorder: '#10B981',
  hr: '#10B981',
  tableBorder: '#d1fae5',
});

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

// 3.2 — Full migration: all 4 v1 keys present
describe('full migration (all 4 v1 keys)', () => {
  it('writes migrated values to v2 keys', () => {
    localStorageMock.setItem(V1_KEYS.content, '# Hello World');
    localStorageMock.setItem(V1_KEYS.colors, SAMPLE_COLORS);
    localStorageMock.setItem(V1_KEYS.customPreset, SAMPLE_COLORS);
    localStorageMock.setItem(V1_KEYS.lastVersion, '1.3.0');

    migrateV1Data();

    expect(localStorageMock.store[V2_KEYS.content]).toBe(JSON.stringify('# Hello World'));
    expect(localStorageMock.store[V2_KEYS.colorTheme]).toBe(SAMPLE_COLORS);
    const presets = JSON.parse(localStorageMock.store[V2_KEYS.customPresets]);
    expect(presets).toHaveLength(1);
    expect(presets[0].name).toBe('My Custom');
    expect(presets[0].colors).toEqual(JSON.parse(SAMPLE_COLORS));
  });

  it('deletes all 4 v1 keys after migration', () => {
    localStorageMock.setItem(V1_KEYS.content, '# Hello World');
    localStorageMock.setItem(V1_KEYS.colors, SAMPLE_COLORS);
    localStorageMock.setItem(V1_KEYS.customPreset, SAMPLE_COLORS);
    localStorageMock.setItem(V1_KEYS.lastVersion, '1.3.0');

    migrateV1Data();

    expect(localStorageMock.store[V1_KEYS.content]).toBeUndefined();
    expect(localStorageMock.store[V1_KEYS.colors]).toBeUndefined();
    expect(localStorageMock.store[V1_KEYS.customPreset]).toBeUndefined();
    expect(localStorageMock.store[V1_KEYS.lastVersion]).toBeUndefined();
  });
});

// 3.3 — Content-only migration
describe('content-only migration', () => {
  it('migrates content and deletes v1 key, leaves v2 color/preset keys absent', () => {
    localStorageMock.setItem(V1_KEYS.content, '# Content Only');

    migrateV1Data();

    expect(localStorageMock.store[V2_KEYS.content]).toBe(JSON.stringify('# Content Only'));
    expect(localStorageMock.store[V2_KEYS.colorTheme]).toBeUndefined();
    expect(localStorageMock.store[V2_KEYS.customPresets]).toBeUndefined();
    expect(localStorageMock.store[V1_KEYS.content]).toBeUndefined();
  });
});

// 3.4 — Colors-only migration
describe('colors-only migration', () => {
  it('migrates colors as-is and deletes v1 key', () => {
    localStorageMock.setItem(V1_KEYS.colors, SAMPLE_COLORS);

    migrateV1Data();

    expect(localStorageMock.store[V2_KEYS.colorTheme]).toBe(SAMPLE_COLORS);
    expect(localStorageMock.store[V2_KEYS.content]).toBeUndefined();
    expect(localStorageMock.store[V2_KEYS.customPresets]).toBeUndefined();
    expect(localStorageMock.store[V1_KEYS.colors]).toBeUndefined();
  });
});

// 3.5 — Preset-only migration
describe('preset-only migration', () => {
  it('migrates preset wrapped in named array and deletes v1 key', () => {
    localStorageMock.setItem(V1_KEYS.customPreset, SAMPLE_COLORS);

    migrateV1Data();

    const presets = JSON.parse(localStorageMock.store[V2_KEYS.customPresets]);
    expect(presets).toHaveLength(1);
    expect(presets[0].name).toBe('My Custom');
    expect(localStorageMock.store[V2_KEYS.content]).toBeUndefined();
    expect(localStorageMock.store[V2_KEYS.colorTheme]).toBeUndefined();
    expect(localStorageMock.store[V1_KEYS.customPreset]).toBeUndefined();
  });
});

// 3.6 — No v1 keys: silent no-op
describe('no v1 keys present', () => {
  it('does nothing when no v1 keys exist', () => {
    migrateV1Data();

    expect(localStorageMock.store[V2_KEYS.content]).toBeUndefined();
    expect(localStorageMock.store[V2_KEYS.colorTheme]).toBeUndefined();
    expect(localStorageMock.store[V2_KEYS.customPresets]).toBeUndefined();
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });
});

// 3.7 — Idempotency: second run is no-op because v1 keys were deleted
describe('idempotency', () => {
  it('second invocation is a silent no-op', () => {
    localStorageMock.setItem(V1_KEYS.content, '# Hello');

    migrateV1Data();
    const v2ContentAfterFirst = localStorageMock.store[V2_KEYS.content];
    const callsAfterFirst = localStorageMock.setItem.mock.calls.length;

    migrateV1Data();

    expect(localStorageMock.store[V2_KEYS.content]).toBe(v2ContentAfterFirst);
    expect(localStorageMock.setItem.mock.calls.length).toBe(callsAfterFirst);
  });
});

// 3.8 — Malformed JSON handling
describe('malformed JSON handling', () => {
  it('copies malformed colors string as-is (no JSON.parse on colors), still migrates content', () => {
    localStorageMock.setItem(V1_KEYS.content, '# Good Content');
    localStorageMock.setItem(V1_KEYS.colors, 'not-valid-json{{{');

    migrateV1Data();

    expect(localStorageMock.store[V2_KEYS.content]).toBe(JSON.stringify('# Good Content'));
    expect(localStorageMock.store[V2_KEYS.colorTheme]).toBe('not-valid-json{{{');
    expect(localStorageMock.store[V1_KEYS.content]).toBeUndefined();
    expect(localStorageMock.store[V1_KEYS.colors]).toBeUndefined();
  });

  it('skips malformed preset (parse error), still migrates content and colors, still deletes all v1 keys', () => {
    localStorageMock.setItem(V1_KEYS.content, '# Content');
    localStorageMock.setItem(V1_KEYS.colors, SAMPLE_COLORS);
    localStorageMock.setItem(V1_KEYS.customPreset, '{bad json');

    migrateV1Data();

    expect(localStorageMock.store[V2_KEYS.content]).toBe(JSON.stringify('# Content'));
    expect(localStorageMock.store[V2_KEYS.colorTheme]).toBe(SAMPLE_COLORS);
    expect(localStorageMock.store[V2_KEYS.customPresets]).toBeUndefined();
    expect(localStorageMock.store[V1_KEYS.customPreset]).toBeUndefined();
  });
});

// 3.9 — Hebrew/Unicode content preservation
describe('Hebrew and Unicode content preservation', () => {
  it('preserves Hebrew text without corruption', () => {
    const hebrewContent = '# שלום עולם\n\nתוכן בעברית עם **הדגשה** ו*הטיה*';
    localStorageMock.setItem(V1_KEYS.content, hebrewContent);

    migrateV1Data();

    expect(JSON.parse(localStorageMock.store[V2_KEYS.content])).toBe(hebrewContent);
  });

  it('preserves mixed Hebrew-English content including emoji', () => {
    const mixedContent = '# Hello / שלום\n\nMixed 🎉 content';
    localStorageMock.setItem(V1_KEYS.content, mixedContent);

    migrateV1Data();

    expect(JSON.parse(localStorageMock.store[V2_KEYS.content])).toBe(mixedContent);
  });
});

// 3.10 — Empty string content migration
describe('empty string content', () => {
  it('migrates empty string content when it is the only v1 key', () => {
    localStorageMock.setItem(V1_KEYS.content, '');

    migrateV1Data();

    expect(localStorageMock.store[V2_KEYS.content]).toBe(JSON.stringify(''));
    expect(localStorageMock.store[V1_KEYS.content]).toBeUndefined();
  });

  it('migrates empty string content alongside other v1 keys', () => {
    localStorageMock.setItem(V1_KEYS.content, '');
    localStorageMock.setItem(V1_KEYS.lastVersion, '1.3.0');

    migrateV1Data();

    expect(localStorageMock.store[V2_KEYS.content]).toBe(JSON.stringify(''));
  });
});

// 3.11 — v2 format compatibility
describe('v2 format compatibility', () => {
  it('v2 content is parseable back to the original string', () => {
    const original = '# My Document\n\nSome **bold** and *italic* text.';
    localStorageMock.setItem(V1_KEYS.content, original);

    migrateV1Data();

    expect(JSON.parse(localStorageMock.store[V2_KEYS.content])).toBe(original);
  });

  it('does not overwrite existing v2 content', () => {
    localStorageMock.setItem(V2_KEYS.content, JSON.stringify('existing v2 content'));
    localStorageMock.setItem(V1_KEYS.content, 'old v1 content');

    migrateV1Data();

    expect(JSON.parse(localStorageMock.store[V2_KEYS.content])).toBe('existing v2 content');
    expect(localStorageMock.store[V1_KEYS.content]).toBeUndefined();
  });

  it('does not overwrite existing v2 color theme', () => {
    localStorageMock.setItem(V2_KEYS.colorTheme, '{"primaryText":"#000000"}');
    localStorageMock.setItem(V1_KEYS.colors, SAMPLE_COLORS);

    migrateV1Data();

    expect(localStorageMock.store[V2_KEYS.colorTheme]).toBe('{"primaryText":"#000000"}');
    expect(localStorageMock.store[V1_KEYS.colors]).toBeUndefined();
  });

  it('does not overwrite existing v2 custom presets', () => {
    const existingPresets = JSON.stringify([{ name: 'Existing', colors: {} }]);
    localStorageMock.setItem(V2_KEYS.customPresets, existingPresets);
    localStorageMock.setItem(V1_KEYS.customPreset, SAMPLE_COLORS);

    migrateV1Data();

    expect(localStorageMock.store[V2_KEYS.customPresets]).toBe(existingPresets);
    expect(localStorageMock.store[V1_KEYS.customPreset]).toBeUndefined();
  });

  it('v2 custom presets array is parseable and correctly structured', () => {
    localStorageMock.setItem(V1_KEYS.customPreset, SAMPLE_COLORS);

    migrateV1Data();

    const parsed = JSON.parse(localStorageMock.store[V2_KEYS.customPresets]);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0]).toHaveProperty('name', 'My Custom');
    expect(parsed[0]).toHaveProperty('colors');
  });
});
