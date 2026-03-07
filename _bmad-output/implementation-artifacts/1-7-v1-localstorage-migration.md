# Story 1.7: V1 localStorage Migration

Status: ready-for-dev

## Story

As an existing v1 user,
I want my saved content, colors, and settings to automatically transfer to Marko v2,
so that I experience a seamless transition without losing any of my customizations.

## Acceptance Criteria (BDD)

1. **AC1: Initial Detection** — Given a user visits Marko v2 with v1 localStorage keys present (`mdEditorContent`, `mdEditorColors`, `mdEditorCustomPreset`, `mdEditorLastVersion`), when the migration function runs on page load, then migration is triggered.

2. **AC2: Content Migration** — Given v1 key `mdEditorContent` exists (raw markdown string, NOT JSON-wrapped), when migration processes it, then content is written to `marko-v2-editor-content` as `JSON.stringify(rawString)` so `useLocalStorage` can parse it.

3. **AC3: Color Settings Migration** — Given v1 key `mdEditorColors` exists (JSON string with 16 color properties), when migration processes it, then colors are copied to `marko-v2-color-theme` preserving the JSON string as-is (already compatible with `useLocalStorage` parse).

4. **AC4: Custom Preset Migration** — Given v1 key `mdEditorCustomPreset` exists (JSON string, same 16-property structure), when migration processes it, then preset is stored to `marko-v2-custom-presets` as `JSON.stringify([{ name: "My Custom", colors: parsedObject }])` for forward compatibility with the v2 preset array format.

5. **AC5: Cleanup** — Given migration completes successfully, then all 4 v1 keys are deleted from localStorage.

6. **AC6: Idempotency** — Given no v1 keys exist (either never existed or already migrated), when migration runs, then it returns immediately with no side effects. The absence of v1 keys IS the idempotency guard — do NOT add a separate migration flag.

7. **AC7: Silent Skip** — Given no v1 keys exist, migration is silently skipped with no errors, no console output, no UI indication.

8. **AC8: Non-Blocking** — Migration is synchronous but runs at module-import time (before React state initialization), completing in microseconds. The editor UI renders immediately with migrated data available on first paint.

## Tasks / Subtasks

- [ ] Task 1: Create v1 migration module (AC: #1-#7)
  - [ ] 1.1: Create `lib/migration/v1-migration.ts` exporting `migrateV1Data()` function
  - [ ] 1.2: Implement v1 key detection (check all 4 keys, proceed if ANY exist)
  - [ ] 1.3: Implement content migration: `JSON.stringify(rawV1Content)` → `marko-v2-editor-content`
  - [ ] 1.4: Implement color migration: copy raw JSON string → `marko-v2-color-theme`
  - [ ] 1.5: Implement preset migration: parse v1 preset, wrap as `[{ name: "My Custom", colors }]`, stringify → `marko-v2-custom-presets`
  - [ ] 1.6: Delete all 4 v1 keys after successful migration
  - [ ] 1.7: Add SSR guard: `if (typeof window === 'undefined') return`
  - [ ] 1.8: Add try/catch around entire migration with silent failure (no throw, no console)
- [ ] Task 2: Integrate migration into editor page (AC: #8)
  - [ ] 2.1: Add module-level `migrateV1Data()` call in `app/editor/page.tsx` (before component definition, after imports)
- [ ] Task 3: Write comprehensive tests (AC: #1-#8)
  - [ ] 3.1: Create `lib/migration/v1-migration.test.ts` with Vitest
  - [ ] 3.2: Test full migration (all 4 v1 keys present → all migrated + deleted)
  - [ ] 3.3: Test content-only migration (only `mdEditorContent` present)
  - [ ] 3.4: Test colors-only migration (only `mdEditorColors` present)
  - [ ] 3.5: Test preset-only migration (only `mdEditorCustomPreset` present)
  - [ ] 3.6: Test no v1 keys (silent no-op, no v2 keys created)
  - [ ] 3.7: Test idempotency (run twice → second run is no-op)
  - [ ] 3.8: Test malformed JSON in colors/preset (graceful skip of that key, migrate others)
  - [ ] 3.9: Test Hebrew/Unicode content preservation
  - [ ] 3.10: Test empty string content migration
  - [ ] 3.11: Verify v2 content is JSON-parse-compatible (critical format test)

## Dev Notes

### V1 Data Schemas (EXACT — from v1 codebase analysis)

The v1 app stores exactly 4 localStorage keys. These are the EXACT formats the migration must handle:

**`mdEditorContent`** — Raw markdown string, NOT JSON-wrapped
```
// V1 stores raw text:
localStorage.setItem('mdEditorContent', editor.value);
// Result in localStorage: # Hello World\n\nSome content...
// NOTE: No JSON quotes wrapping the string!
```

**`mdEditorColors`** — JSON.stringify'd object with exactly 16 color properties (all hex values)
```json
{
  "primaryText": "#064E3B",
  "secondaryText": "#047857",
  "link": "#10B981",
  "code": "#10B981",
  "h1": "#064E3B",
  "h1Border": "#10B981",
  "h2": "#064E3B",
  "h2Border": "#6EE7B7",
  "h3": "#047857",
  "previewBg": "#FFFFFF",
  "codeBg": "#0d1117",
  "blockquoteBg": "#F0FDF4",
  "tableHeader": "#10B981",
  "tableAlt": "#F0FDF4",
  "blockquoteBorder": "#10B981",
  "hr": "#10B981",
  "tableBorder": "#d1fae5"
}
```

**`mdEditorCustomPreset`** — JSON.stringify'd object, identical 16-property structure as mdEditorColors

**`mdEditorLastVersion`** — Plain version string (e.g., `"1.3.0"`) — delete only, do not migrate

### V2 Storage Format (CRITICAL)

The `useLocalStorage<T>(key, default)` hook (in `lib/hooks/useLocalStorage.ts`) uses `JSON.stringify()` on write and `JSON.parse()` on read. This creates a critical format difference for content:

| Data | V1 Format in localStorage | V2 Format in localStorage | Migration Transform |
|------|--------------------------|--------------------------|-------------------|
| Content | Raw string: `# Hello` | JSON string: `"# Hello"` | `JSON.stringify(v1Raw)` |
| Colors | JSON: `{"primaryText":"#064E3B",...}` | JSON: `{"primaryText":"#064E3B",...}` | Copy as-is |
| Custom Preset | JSON: `{"primaryText":"#064E3B",...}` | JSON: `[{"name":"My Custom","colors":{...}}]` | Parse, wrap in array, stringify |

### V2 Target Key Constants

| V1 Key | V2 Key | Used By |
|--------|--------|---------|
| `mdEditorContent` | `marko-v2-editor-content` | `useEditorContent` (Story 1.2, already exists) |
| `mdEditorColors` | `marko-v2-color-theme` | `useColorTheme` (Story 2.1, future) |
| `mdEditorCustomPreset` | `marko-v2-custom-presets` | Custom preset hook (Story 2.3, future) |
| `mdEditorLastVersion` | *(not migrated — delete only)* | — |

### Implementation Approach

**Module-level execution (not useEffect):**
```typescript
// app/editor/page.tsx
'use client';
import { migrateV1Data } from '@/lib/migration/v1-migration';

// Runs once when module loads — before any useState/useLocalStorage initialization
migrateV1Data();

export default function EditorPage() {
  const [content, setContent] = useEditorContent(); // reads MIGRATED data
  // ...
}
```

**Why module-level, not useEffect:** `useLocalStorage` reads localStorage in a lazy `useState` initializer (synchronous, on first render). A `useEffect` runs AFTER render, so migrated data would be missed on first paint, causing a flash of empty content. Module-level execution runs before any component code.

**Why not a hook:** The migration is a one-time fire-and-forget operation with no React state. A hook would add unnecessary complexity. A plain function with an SSR guard is the simplest correct solution.

### Migration Function Structure

```typescript
// lib/migration/v1-migration.ts
const V1_KEYS = {
  content: 'mdEditorContent',
  colors: 'mdEditorColors',
  customPreset: 'mdEditorCustomPreset',
  lastVersion: 'mdEditorLastVersion',
} as const;

const V2_KEYS = {
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

    // No v1 data — silently return
    if (!v1Content && !v1Colors && !v1Preset && !v1Version) return;

    // Migrate content (raw string → JSON string)
    if (v1Content !== null) {
      localStorage.setItem(V2_KEYS.content, JSON.stringify(v1Content));
    }

    // Migrate colors (already JSON — copy as-is)
    if (v1Colors !== null) {
      localStorage.setItem(V2_KEYS.colorTheme, v1Colors);
    }

    // Migrate custom preset (wrap in named array for v2 multi-preset support)
    if (v1Preset !== null) {
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
```

**Export V2_KEYS** so Story 2.1 and 2.3 can import and reuse the exact same key strings.

### Edge Cases to Handle

1. **V1 content exists but v2 content already exists** — Do NOT overwrite v2. Check `localStorage.getItem(V2_KEYS.content) === null` before writing. User may have started using v2 before migration ran.
2. **Malformed JSON in colors/preset** — `try/catch` around `JSON.parse`, skip that key, continue migrating others.
3. **Empty string content** — Valid case. `""` should be migrated as `JSON.stringify("")` = `'""'`.
4. **localStorage quota exceeded** — Outer try/catch handles this silently.
5. **Private browsing mode** — Some browsers throw on localStorage access. SSR guard + outer try/catch handles this.

### Project Structure Notes

- `lib/migration/v1-migration.ts` — per architecture spec [Source: architecture.md, project structure section]
- `lib/migration/v1-migration.test.ts` — co-located test per project convention
- One-line change in `app/editor/page.tsx` — import + call
- No new dependencies
- No new types needed (migration uses raw localStorage strings)

### Anti-Patterns to Avoid

- **Do NOT** add a `v2_migration_completed` localStorage flag — v1 key absence IS the flag
- **Do NOT** use `useEffect` for migration — it runs after initial render, causing content flash
- **Do NOT** create a React hook for migration — it's a one-time side effect, not reactive state
- **Do NOT** use `console.log/warn/error` — migration must be completely silent
- **Do NOT** show any UI indicating migration occurred — user should not notice
- **Do NOT** import Zustand, Redux, or any state library — plain localStorage API only
- **Do NOT** add migration-specific types to `types/editor.ts` — keep it contained in the migration module
- **Do NOT** overwrite existing v2 keys if they already have data

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1, Story 1.7 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — Data Architecture, v1 localStorage Migration]
- [Source: _bmad-output/planning-artifacts/architecture.md — State Management: no external library, centralized hooks]
- [Source: _bmad-output/planning-artifacts/architecture.md — Project Structure: lib/migration/]
- [Source: hebrew-markdown-export/index.html — v1 localStorage schemas (lines 2485-4675)]
- [Source: lib/hooks/useLocalStorage.ts — JSON.stringify/parse storage pattern]
- [Source: lib/hooks/useEditorContent.ts — v1 migration comment (lines 4-5), key: marko-v2-editor-content]
- [Source: lib/hooks/useViewMode.ts — key: marko-v2-view-mode]
- [Source: 1-6-editor-utilities-and-direction-override.md — key: marko-v2-doc-direction, hook patterns]

### Git Intelligence

Recent commits show consistent pattern: one commit per story implementation, one commit for code-review status sync. Files follow architecture spec locations. No dependency changes in recent commits — this story also requires no new dependencies.

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
