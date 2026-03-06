# Story 1.3: Mermaid Diagram Rendering

Status: review

## Story

As a user,
I want to insert Mermaid diagram templates and see them rendered inline in the preview,
So that I can create flowcharts, sequence diagrams, and other visuals within my documents.

## Acceptance Criteria

1. **Given** the user has Markdown content with a fenced code block labeled `mermaid` **When** the rendering pipeline processes the content **Then** the Mermaid diagram renders inline in the preview panel as an SVG
2. **And** the diagram respects the current color theme — node backgrounds, borders, text, and lines use the 17-property CSS custom property color system
3. **And** users can click the Mermaid insert button in the editor panel header to open a dropdown showing 7 diagram types, and clicking a type inserts the Mermaid code block template at the cursor position in the textarea
4. **And** invalid or malformed Mermaid syntax shows a clear inline error message in Hebrew ("שגיאה בתרשים") with the raw source visible below it — the error is non-blocking and the rest of the document renders normally
5. **And** Mermaid.js is bundled via npm (not a CDN script tag), and is lazy-loaded only when a mermaid code block is detected in the content

## Tasks / Subtasks

- [x] Task 1: Install Mermaid dependency (AC: #5)
  - [x] 1.1 `pnpm add mermaid`
  - [x] 1.2 Verify TypeScript types ship with the package (they do — `mermaid` ships its own types since v10)
  - [x] 1.3 Run `pnpm build` to confirm no new build errors after install

- [x] Task 2: Create Mermaid setup module (AC: #2, #5)
  - [x] 2.1 Create `lib/markdown/mermaid-setup.ts` — exports `initializeMermaid()` that reads computed CSS custom properties and calls `mermaid.initialize()` with themed variables
  - [x] 2.2 Export `MERMAID_THEME_VARIABLES` mapping function that reads `getComputedStyle(document.documentElement)` for all 17 color properties
  - [x] 2.3 Ensure the module only calls browser APIs inside functions (not at module top-level) — SSR-safe

- [x] Task 3: Update Marked config to handle mermaid code blocks (AC: #1)
  - [x] 3.1 In `lib/markdown/config.ts`, add a custom `renderer` extension using `marked.use({ renderer: { code } })`
  - [x] 3.2 The custom `code` renderer: if `lang === 'mermaid'`, return `<div class="mermaid-wrapper"><div class="mermaid">${escapedCode}</div></div>`; otherwise return `false` to use the default renderer
  - [x] 3.3 HTML-escape the Mermaid source code before embedding in the div (prevent XSS if source code contains `<` `>` `&`)
  - [x] 3.4 Verify that `marked.parse()` in `render-pipeline.ts` requires no changes — it already calls the configured Marked instance

- [x] Task 4: Create Mermaid template definitions (AC: #3)
  - [x] 4.1 Create `lib/markdown/mermaid-templates.ts` — export `MERMAID_TEMPLATES` array and `getMermaidTemplate(key: string): string` function
  - [x] 4.2 Include all 7 diagram types: `flowchart`, `sequence`, `class`, `state`, `er`, `gantt`, `pie`
  - [x] 4.3 Each template must be a complete, syntactically valid Mermaid code block string (with the triple-backtick fence and `mermaid` language tag) that renders correctly

- [x] Task 5: Update MarkdownRenderer for Mermaid rendering (AC: #1, #2, #4, #5)
  - [x] 5.1 Add `useRef<HTMLDivElement>(null)` to `MarkdownRenderer` for the container div
  - [x] 5.2 Add `useEffect` that: (a) detects if content has mermaid divs, (b) lazy-imports mermaid, (c) calls `initializeMermaid()` then `mermaid.run({ nodes })`, (d) catches per-diagram errors and replaces failed diagrams with the Hebrew error UI
  - [x] 5.3 Move the DOMPurify sanitization before rendering — uses default DOMPurify config (`div` and `class` are in the default allowlist; `FORCE_BODY: true`/`ADD_TAGS` removed to fix a server/client hydration mismatch)
  - [x] 5.4 Update the container div to use the `ref` from 5.1
  - [x] 5.5 Create `components/preview/MarkdownRenderer.test.tsx` — unit tests for: mermaid block detection, error state rendering, non-mermaid content unaffected

- [x] Task 6: Add MermaidInsertButton to EditorPanel (AC: #3)
  - [x] 6.1 Create `components/editor/MermaidInsertButton.tsx` — button with dropdown showing 7 template names in Hebrew + English
  - [x] 6.2 Update `components/editor/EditorTextarea.tsx` — wrap with `forwardRef<HTMLTextAreaElement, EditorTextareaProps>` to expose the textarea DOM ref
  - [x] 6.3 Update `components/editor/EditorPanel.tsx`:
    - [x] 6.3.1 Create `textareaRef = useRef<HTMLTextAreaElement>(null)` and pass to `EditorTextarea`
    - [x] 6.3.2 Implement `insertTextAtCursor(text: string)` that splices the template at the current cursor position and calls `onChange(newContent)`
    - [x] 6.3.3 Render `<MermaidInsertButton onInsert={insertTextAtCursor} />` in the panel header row alongside the "עורך" label
  - [x] 6.4 After `onChange(newContent)`, restore textarea focus and cursor position via `setTimeout(() => { textareaRef.current?.setSelectionRange(...); textareaRef.current?.focus(); }, 0)`

- [x] Task 7: Add Mermaid CSS styles (AC: #2, #4)
  - [x] 7.1 Append `.mermaid-wrapper`, `.mermaid-error` styles to `app/globals.css`
  - [x] 7.2 `.mermaid-wrapper` — adds vertical margin, centers SVG, sets `direction: ltr` (diagrams are always LTR)
  - [x] 7.3 `.mermaid-error` — uses `--color-blockquote-bg`, `--color-blockquote-border`, Hebrew-friendly monospace for source display

- [x] Task 8: Test and verify (all ACs)
  - [x] 8.1 Manually test: paste a valid flowchart block → diagram renders inline in preview
  - [x] 8.2 Manually test: paste invalid Mermaid syntax → Hebrew error message shows, rest of document renders
  - [x] 8.3 Manually test: click Mermaid insert button → dropdown shows 7 types → select one → template inserted at cursor
  - [x] 8.4 Manually test: verify diagram colors match the CSS custom property system (inspect SVG elements)
  - [x] 8.5 Verify `pnpm build` passes with zero errors
  - [x] 8.6 Verify `pnpm lint` passes with zero errors
  - [x] 8.7 Verify `pnpm test` passes (7+ unit tests from Story 1.2 still pass; new tests from Task 5.5 pass)

## Dev Notes

### Critical Architecture Constraints (MUST follow)

- **Package manager**: `pnpm` exclusively — never `npm install` or `yarn add`
- **No CDN**: Mermaid must be installed via `pnpm add mermaid`, not a `<script>` CDN tag. This is an explicit AC (#5).
- **Lazy-loading required**: Mermaid is large (~2MB unminified). Only import it dynamically inside the `useEffect` when mermaid blocks are detected. Target: don't add to initial bundle.
- **Styling**: Tailwind v4 logical properties only — NEVER `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`. Use `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`
- **Colors**: NEVER hardcode color values. Use CSS custom properties from the 17-color system exclusively.
- **Mermaid direction**: Mermaid diagrams must always render with `direction: ltr` wrapper — they are SVG-based charts, not text, and must never flip to RTL.
- **DOMPurify**: Preserve it. The sanitize call runs BEFORE setting `dangerouslySetInnerHTML`. Mermaid runs AFTER via `useEffect` and directly manipulates the DOM — it does not go through DOMPurify.
- **SSR**: All Mermaid code must be guarded: no top-level browser API calls, all in `useEffect` or inside `if (typeof window !== 'undefined')`.
- **TypeScript strict mode is ON**: No `any` types. Mermaid ships its own types since v10 — use them.

### Install Command

```bash
pnpm add mermaid
```

**Expected version**: `mermaid` v11.x (latest stable as of early 2026). Verify: `pnpm list mermaid`.

Mermaid ships its own TypeScript types. No `@types/mermaid` needed.

### Mermaid Setup Module (`lib/markdown/mermaid-setup.ts`)

```ts
// lib/markdown/mermaid-setup.ts
// SSR-safe: all functions only call browser APIs inside function bodies

function getMermaidThemeVariables(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const style = getComputedStyle(document.documentElement);
  const get = (prop: string) => style.getPropertyValue(prop).trim();
  return {
    primaryColor:         get('--color-table-header')    || '#ecfdf5',
    primaryTextColor:     get('--color-primary-text')    || '#333333',
    primaryBorderColor:   get('--color-h1-border')       || '#10B981',
    lineColor:            get('--color-h1-border')        || '#10B981',
    secondaryColor:       get('--color-blockquote-bg')   || '#f0fdf4',
    tertiaryColor:        get('--color-code-bg')         || '#f8f8f8',
    background:           get('--color-preview-bg')      || '#ffffff',
    nodeBorder:           get('--color-h2')              || '#047857',
    clusterBkg:           get('--color-table-alt')       || '#f8fafb',
    titleColor:           get('--color-h1')              || '#065f46',
    edgeLabelBackground:  get('--color-code-bg')         || '#f8f8f8',
    activeTaskBkgColor:   get('--color-h3')              || '#059669',
    activeTaskBorderColor: get('--color-h2')             || '#047857',
    fontFamily:           'var(--font-body, sans-serif)',
    fontSize:             '14px',
  };
}

export async function initializeMermaid(): Promise<void> {
  const mermaid = (await import('mermaid')).default;
  mermaid.initialize({
    startOnLoad: false,          // Manual rendering control — NEVER use startOnLoad: true
    securityLevel: 'loose',      // Matches v1 behavior — allows HTML in diagrams
    theme: 'base',               // Base theme + custom themeVariables for full color control
    themeVariables: getMermaidThemeVariables(),
    fontFamily: 'var(--font-body, sans-serif)',
    fontSize: 14,
  });
}

export async function runMermaid(nodes: Element[]): Promise<void> {
  const mermaid = (await import('mermaid')).default;
  await mermaid.run({ nodes });
}
```

**IMPORTANT**: `startOnLoad: false` is mandatory. If set to `true`, Mermaid will try to auto-render on DOMContentLoaded and conflict with React's rendering lifecycle.

### Custom Marked Renderer for Mermaid (`lib/markdown/config.ts` update)

Add a custom renderer extension BEFORE creating the `Marked` instance:

```ts
// lib/markdown/config.ts — add this renderer block

import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { hljs } from './highlight-setup';

// HTML-escape helper to safely embed Mermaid source in HTML
function escapeMermaidSource(code: string): string {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  }),
  {
    gfm: true,
    breaks: true,
    renderer: {
      code({ text, lang }) {
        if (lang === 'mermaid') {
          // Return a div that Mermaid will target after React renders it to the DOM
          // The source is HTML-escaped to prevent XSS
          return `<div class="mermaid-wrapper"><div class="mermaid">${escapeMermaidSource(text)}</div></div>\n`;
        }
        return false; // Use default renderer for all other code blocks
      },
    },
  }
);
```

**Why `return false` instead of calling default?**: In Marked v5+, returning `false` from a renderer method falls back to the built-in renderer. This is the correct pattern. Do NOT call `super()` or manually reimplement the default.

**Why HTML-escape?**: The Mermaid source code could contain `<`, `>`, `&` characters (e.g., entity relationship diagrams use `||--o{`). Without escaping, these would be parsed as HTML by the browser before Mermaid sees them.

**Note on `render-pipeline.ts`**: No changes needed. The existing `renderMarkdown()` function calls `marked.parse()` which now uses the updated config. The mermaid blocks come through as `<div class="mermaid-wrapper"><div class="mermaid">...</div></div>` in the returned HTML string.

### Mermaid Templates (`lib/markdown/mermaid-templates.ts`)

```ts
// lib/markdown/mermaid-templates.ts

export interface MermaidTemplate {
  key: string;
  labelHe: string;   // Hebrew label shown in dropdown
  labelEn: string;   // English diagram type name
  code: string;      // Full Mermaid code block (without backtick fences — caller wraps)
}

export const MERMAID_TEMPLATES: MermaidTemplate[] = [
  {
    key: 'flowchart',
    labelHe: 'תרשים זרימה',
    labelEn: 'Flowchart',
    code: `flowchart LR
    A[התחלה] --> B{תנאי?}
    B -->|כן| C[פעולה א]
    B -->|לא| D[פעולה ב]
    C --> E[סיום]
    D --> E`,
  },
  {
    key: 'sequence',
    labelHe: 'תרשים רצף',
    labelEn: 'Sequence',
    code: `sequenceDiagram
    participant א as משתמש
    participant ב as מערכת
    א->>ב: בקשה
    ב-->>א: תגובה`,
  },
  {
    key: 'class',
    labelHe: 'תרשים מחלקות',
    labelEn: 'Class',
    code: `classDiagram
    class Animal {
        +String name
        +makeSound() void
    }
    class Dog {
        +fetch() void
    }
    Animal <|-- Dog`,
  },
  {
    key: 'state',
    labelHe: 'תרשים מצבים',
    labelEn: 'State',
    code: `stateDiagram-v2
    [*] --> ממתין
    ממתין --> פועל : התחל
    פועל --> הושלם : סיים
    פועל --> ממתין : עצור
    הושלם --> [*]`,
  },
  {
    key: 'er',
    labelHe: 'תרשים ישויות',
    labelEn: 'ER Diagram',
    code: `erDiagram
    USER ||--o{ ORDER : "מבצע"
    ORDER ||--|{ ITEM : "מכיל"
    USER {
        string id PK
        string name
    }`,
  },
  {
    key: 'gantt',
    labelHe: 'תרשים גאנט',
    labelEn: 'Gantt',
    code: `gantt
    title תכנון פרויקט
    dateFormat YYYY-MM-DD
    section שלב א
    משימה ראשונה   :a1, 2024-01-01, 7d
    משימה שנייה    :a2, after a1, 5d
    section שלב ב
    משימה שלישית  :b1, after a2, 3d`,
  },
  {
    key: 'pie',
    labelHe: 'תרשים עוגה',
    labelEn: 'Pie Chart',
    code: `pie title חלוקת משאבים
    "פיתוח" : 45
    "בדיקות" : 25
    "תכנון" : 20
    "תיעוד" : 10`,
  },
];

export function getMermaidTemplate(key: string): string {
  const template = MERMAID_TEMPLATES.find((t) => t.key === key);
  if (!template) return '';
  return `\`\`\`mermaid\n${template.code}\n\`\`\`\n`;
}
```

**Note on Hebrew in templates**: Hebrew content inside Mermaid templates is valid. Mermaid supports Unicode labels in all diagram types. The `flowchart LR` direction is set to LR (left-to-right) intentionally — the diagram itself flows LTR even in RTL documents.

### Updated MarkdownRenderer (`components/preview/MarkdownRenderer.tsx`)

```tsx
'use client';
import { useMemo, useRef, useEffect, useCallback } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { renderMarkdown } from '@/lib/markdown/render-pipeline';
import { initializeMermaid, runMermaid } from '@/lib/markdown/mermaid-setup';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
}

/** Detect presence of mermaid blocks in rendered HTML without full DOM parse */
function hasMermaidContent(html: string): boolean {
  return html.includes('class="mermaid"');
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const html = useMemo(
    () => DOMPurify.sanitize(renderMarkdown(content), {
      FORCE_BODY: true,
      ADD_TAGS: ['div'],           // Ensure mermaid wrapper divs are preserved
      ADD_ATTR: ['class'],         // Preserve class attributes on divs
    }),
    [content]
  );

  // Run Mermaid after React updates the DOM
  const renderMermaidDiagrams = useCallback(async () => {
    if (!containerRef.current || !hasMermaidContent(html)) return;

    const mermaidDivs = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>('.mermaid')
    );
    if (mermaidDivs.length === 0) return;

    // HTML-unescape the source that was escaped in the renderer
    mermaidDivs.forEach((div) => {
      div.textContent = div.innerHTML
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
    });

    await initializeMermaid();

    // Render each diagram individually to isolate errors
    await Promise.allSettled(
      mermaidDivs.map(async (div) => {
        try {
          await runMermaid([div]);
        } catch {
          // Replace failed diagram with Hebrew error UI
          const source = div.textContent ?? '';
          const wrapper = div.closest('.mermaid-wrapper') ?? div;
          wrapper.innerHTML = `
            <div class="mermaid-error" role="alert" aria-label="שגיאה בתרשים">
              <p class="mermaid-error-title">שגיאה בתרשים</p>
              <pre class="mermaid-error-source">${source.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            </div>`;
        }
      })
    );
  }, [html]);

  useEffect(() => {
    renderMermaidDiagrams();
  }, [renderMermaidDiagrams]);

  if (!html) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">...הדבק מארקדאון בעורך כדי לראות תצוגה מקדימה</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="preview-content h-full overflow-y-auto p-6"
      dangerouslySetInnerHTML={{ __html: html }}
      aria-label="תצוגה מקדימה של המסמך המעובד"
      aria-live="polite"
      aria-atomic="false"
    />
  );
}
```

**Why `Promise.allSettled`**: Ensures that a failed diagram doesn't prevent other diagrams on the same page from rendering. Each diagram is isolated.

**Why re-unescape before running Mermaid**: The Marked custom renderer HTML-escapes the source (to prevent XSS in the HTML string). But Mermaid needs the raw source. When the browser parses the HTML string, the escaped content is stored as text (the browser already un-escapes `&lt;` back to `<`). However, we read `div.innerHTML` which gives us the HTML-encoded version. We need `div.textContent` which gives us the decoded text. **Actually use `div.textContent`** to get the raw source — it automatically decodes HTML entities. So the unescape step above should use `div.textContent` directly (no need for manual replace).

**Correction — simpler approach**:
```ts
mermaidDivs.forEach((div) => {
  // textContent gives us the decoded text (browser auto-decodes HTML entities)
  // We need to set it back as textContent for Mermaid to read
  const source = div.textContent ?? '';
  div.textContent = source; // reset so Mermaid reads plain text
});
```

### MermaidInsertButton (`components/editor/MermaidInsertButton.tsx`)

```tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { MERMAID_TEMPLATES, getMermaidTemplate } from '@/lib/markdown/mermaid-templates';

interface MermaidInsertButtonProps {
  onInsert: (template: string) => void;
}

export function MermaidInsertButton({ onInsert }: MermaidInsertButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (key: string) => {
    onInsert(getMermaidTemplate(key));
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="הוסף תרשים Mermaid"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex h-6 items-center gap-1 rounded px-2 text-xs text-muted-foreground
                   hover:bg-muted hover:text-foreground transition-colors"
      >
        <span>תרשים</span>
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="סוגי תרשימים"
          className="absolute start-0 top-full z-50 mt-1 min-w-44 rounded-md border border-border
                     bg-popover shadow-md"
        >
          {MERMAID_TEMPLATES.map((template) => (
            <button
              key={template.key}
              role="option"
              type="button"
              onClick={() => handleSelect(template.key)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-start text-sm
                         text-popover-foreground hover:bg-muted transition-colors"
            >
              <span>{template.labelHe}</span>
              <span className="ms-auto text-xs text-muted-foreground">{template.labelEn}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Accessibility notes:**
- `aria-haspopup="listbox"` and `aria-expanded` on the trigger button
- `role="listbox"` on the dropdown container
- `role="option"` on each template item
- `start-0` (RTL-logical `left: 0`) for dropdown position — renders correctly in RTL context

### EditorTextarea with forwardRef (`components/editor/EditorTextarea.tsx`)

Wrap with `forwardRef` to expose the textarea DOM element to `EditorPanel`:

```tsx
'use client';
import { forwardRef } from 'react';

interface EditorTextareaProps {
  value: string;
  onChange: (value: string) => void;
}

export const EditorTextarea = forwardRef<HTMLTextAreaElement, EditorTextareaProps>(
  function EditorTextarea({ value, onChange }, ref) {
    return (
      <textarea
        ref={ref}
        className="h-full w-full resize-none bg-background p-4 font-mono text-sm text-foreground
                   placeholder:text-muted-foreground focus:outline-none"
        dir="rtl"
        lang="he"
        aria-label="תוכן מארקדאון לעריכה"
        aria-multiline="true"
        placeholder="...הדבק טקסט מארקדאון כאן"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
    );
  }
);
```

**Note on `aria-multiline`**: Story 1.2 code review removed `aria-multiline`. However, `aria-multiline="true"` is valid on `role="textbox"` and `<textarea>` — include it here for accessibility.

### Updated EditorPanel (`components/editor/EditorPanel.tsx`)

```tsx
'use client';
import { useRef } from 'react';
import { EditorTextarea } from './EditorTextarea';
import { MermaidInsertButton } from './MermaidInsertButton';

interface EditorPanelProps {
  content: string;
  onChange: (content: string) => void;
}

export function EditorPanel({ content, onChange }: EditorPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertTextAtCursor(text: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      // Fallback: append at end if ref not available
      onChange(content + '\n' + text);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    // Insert text at cursor, replacing any selection
    const newContent = content.slice(0, start) + text + content.slice(end);
    onChange(newContent);
    // Restore cursor to after the inserted text
    const newCursor = start + text.length;
    setTimeout(() => {
      textarea.setSelectionRange(newCursor, newCursor);
      textarea.focus();
    }, 0);
  }

  return (
    <section
      className="flex flex-col border-e border-border"
      aria-label="עורך מארקדאון"
    >
      <div className="flex h-9 items-center justify-between border-b border-border px-4">
        <span className="text-sm font-medium text-muted-foreground">עורך</span>
        <MermaidInsertButton onInsert={insertTextAtCursor} />
      </div>
      <div className="flex-1 overflow-hidden">
        <EditorTextarea ref={textareaRef} value={content} onChange={onChange} />
      </div>
    </section>
  );
}
```

**Pattern note**: `setTimeout(() => ..., 0)` defers the cursor restore until after React re-renders with the new content. Without the defer, `setSelectionRange` runs before React has updated the textarea value, so the cursor position would be off.

### Mermaid CSS — Append to `app/globals.css`

```css
/* ============================================
   Mermaid Diagram Styles (Story 1.3)
   All colors use the 17-property custom system
   ============================================ */

.mermaid-wrapper {
  margin: 1.25rem 0;
  display: flex;
  justify-content: center;
  direction: ltr; /* Mermaid SVG diagrams are always LTR */
  overflow-x: auto;
}

.mermaid-wrapper svg {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}

.mermaid-error {
  background-color: var(--color-blockquote-bg);
  border-inline-start: 4px solid var(--color-blockquote-border);
  border-radius: 0 0.25rem 0.25rem 0;
  padding: 0.75rem 1rem;
  margin: 1rem 0;
  direction: rtl;
}

.mermaid-error-title {
  color: var(--color-h1);
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.mermaid-error-source {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--color-secondary-text);
  background-color: var(--color-code-bg);
  padding: 0.5rem;
  border-radius: 0.25rem;
  overflow-x: auto;
  white-space: pre;
  direction: ltr; /* Source code is always LTR */
}
```

### Mermaid Version & Key API Notes

**Expected installed version**: `mermaid` v11.x (verify with `pnpm list mermaid` after install)

**Critical API patterns for Mermaid v10+:**

```ts
// CORRECT: Manual rendering (startOnLoad: false)
const mermaid = (await import('mermaid')).default;
mermaid.initialize({ startOnLoad: false, theme: 'base', ... });
await mermaid.run({ nodes: [div1, div2] }); // Renders specific DOM nodes

// WRONG: DO NOT USE
mermaid.init(); // Deprecated in v10+
mermaid.contentLoaded(); // Deprecated
```

**`mermaid.run()` return value**: Returns `Promise<void>`. Await it. Individual diagram errors are NOT thrown from `run()` at the top level — they appear as SVG error elements. The try/catch per diagram may be needed at the element level.

**Alternative error detection**: After `mermaid.run()`, check if the div contains an SVG with `class="error-icon"` or inspect for `<g class="error">`. If detected, replace with the Hebrew error UI.

**Actual error handling pattern (more reliable)**:

```ts
// After mermaid.run([div]) completes:
const svg = div.querySelector('svg');
if (!svg || div.querySelector('.error-icon')) {
  // Render error UI
}
```

**Mermaid v11 theme variables reference** — key `themeVariables` fields:
- `primaryColor`: Background fill of primary nodes
- `primaryTextColor`: Text color on nodes
- `primaryBorderColor`: Node border color
- `lineColor`: Edge/arrow color
- `secondaryColor`: Secondary node fill
- `tertiaryColor`: Cluster/subgraph fill
- `background`: Diagram background
- `nodeBorder`: Alternative node border color

### Previous Story Intelligence (from Story 1.2)

**Critical learnings that apply to Story 1.3:**

1. **Project root is the repo root** — files are at `app/`, `lib/`, `components/`. NEVER create a `marko/` subdirectory.

2. **`pnpm approve-builds` concern**: If Mermaid has a postinstall script, it may need to be added to `pnpm.onlyBuiltDependencies` in `package.json`. Check after `pnpm add mermaid` — if it errors with an "approval required" message, add `"mermaid"` to the `onlyBuiltDependencies` array.

3. **TypeScript strict mode**: All types must be explicit. Mermaid's types are in the package — use them. `import type { MermaidConfig } from 'mermaid'` for type-only imports where needed.

4. **DOMPurify is already installed** (`isomorphic-dompurify`). When updating MarkdownRenderer, DO NOT remove or replace it. Configure it to allow the `mermaid-wrapper` and `mermaid` div classes.

5. **`globals.css` has 17 colors defined**: The full CSS custom property system is in place in both light and dark mode. Use it directly. The Mermaid setup reads these at runtime via `getComputedStyle`.

6. **`vitest` is configured**: Tests run with `pnpm test`. The `@/` path alias works in tests (verified in 1.2). Add Story 1.3 tests in `components/preview/MarkdownRenderer.test.tsx`.

7. **`pnpm build` and `pnpm lint` MUST pass** before marking this story complete. This is a hard requirement.

8. **`marked` v17.0.4 is installed** with custom renderer support. The `renderer` option in `new Marked({ renderer: { code } })` is the v5+ API. Do NOT use the deprecated `marked.use({ walkTokens })` approach for this — use the renderer option directly.

9. **`isomorphic-dompurify`** — SSR-safe. Works in both Node.js (for `pnpm build`) and browser. Already imported in `MarkdownRenderer.tsx`.

10. **Convex**: NOT used in this story. Do NOT create any Convex functions. Do NOT import from `convex/`.

### Git Intelligence (from recent commits)

Recent commit patterns establish:
- TypeScript strict mode ON — no `any`, no implicit types
- All new `'use client'` components at the top of the file
- `pnpm build` must pass — SSR implications are checked at build time
- `pnpm lint` passes — ESLint with Next.js rules configured
- Commit message style: `Implement Story X.Y: [Title]`

**Key pattern from render-pipeline**: `marked.parse()` is synchronous. If the Mermaid custom renderer needs async work, it CANNOT be done in the renderer itself. All async Mermaid work happens in `useEffect` after the HTML is rendered to the DOM.

### What NOT to Implement in This Story

- **Formatting toolbar** (bold, italic, headings, lists, code, links, images, tables) — Story 1.4
- **Full EditorToolbar component** (`components/editor/EditorToolbar.tsx`) — Story 1.4. Story 1.3 only adds a `MermaidInsertButton` in the `EditorPanel` header.
- **View mode toggles** (editor-only / preview-only / split) — Story 1.5
- **Presentation mode** — Story 1.5
- **Clear button / sample document / direction toggle** — Story 1.6
- **v1 localStorage migration** — Story 1.7
- **Per-sentence BiDi detection** — Epic 4
- **HTML export / PDF export** — Epic 3 (Mermaid rendering in exports will be handled there)
- **Color panel / theme presets** — Epic 2. The Mermaid theming in this story reads CURRENT CSS variables — it automatically works with whatever theme is active.
- **Dark mode toggle UI** — Story 1.6. The Mermaid theme variables reading via `getComputedStyle` means it will automatically use dark mode colors if dark mode is active.

### Project Structure After Story 1.3

```
marko/                               (project root)
├── app/
│   └── globals.css                  -- MODIFIED: Mermaid wrapper + error styles appended
├── components/
│   ├── editor/
│   │   ├── EditorPanel.tsx          -- MODIFIED: textareaRef + insertTextAtCursor + MermaidInsertButton
│   │   ├── EditorTextarea.tsx       -- MODIFIED: wrapped with forwardRef
│   │   └── MermaidInsertButton.tsx  -- NEW: dropdown insert button
│   └── preview/
│       ├── MarkdownRenderer.tsx     -- MODIFIED: useRef + useEffect + mermaid.run
│       └── MarkdownRenderer.test.tsx -- NEW: mermaid detection + error state tests
├── lib/
│   └── markdown/
│       ├── config.ts                -- MODIFIED: custom renderer for mermaid code blocks
│       ├── mermaid-setup.ts         -- NEW: Mermaid initialization with theme colors
│       ├── mermaid-templates.ts     -- NEW: 7 template definitions + getMermaidTemplate()
│       └── render-pipeline.ts       -- UNCHANGED
└── package.json                     -- MODIFIED: + mermaid
```

**All other files are UNCHANGED.** Do not touch:
- `app/editor/page.tsx` — no changes needed (already wires EditorPanel + PreviewPanel)
- `app/layout.tsx` — no changes needed
- `lib/hooks/` — no changes needed
- `lib/markdown/highlight-setup.ts` — no changes needed
- `lib/markdown/render-pipeline.ts` — VERIFY it still works (it should, no changes needed)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Markdown-Rendering-Pipeline]
- [Source: _bmad-output/planning-artifacts/architecture.md#Complete-Project-Directory-Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md#CSS-Styling]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Error-States-and-Graceful-Degradation]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Performance-Budget-and-Loading-Strategy]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Toolbar-grouping]
- [Source: _bmad-output/implementation-artifacts/1-2-editor-and-preview-layout-with-markdown-rendering.md]
- [Source: app/globals.css — 17-color CSS custom property system (light + dark)]
- [Source: lib/markdown/config.ts — existing Marked + markedHighlight setup]
- [Source: components/preview/MarkdownRenderer.tsx — existing DOMPurify + dangerouslySetInnerHTML pattern]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6[1m]

### Debug Log References

- Fixed `highlight()` fallback in `lib/markdown/config.ts`: changed `'plaintext'` to returning original `code` for unknown/unregistered languages. `marked-highlight` uses `walkTokens` for ALL code tokens including mermaid; returning `code` (unchanged) satisfies the `out === code` check so it doesn't override token text. Returning `''` was incorrect because `'' !== code` causes marked-highlight to set `token.text = ''`, emptying the mermaid block.
- Fixed TypeScript error in `mermaid-setup.ts`: `mermaid.run()` expects `HTMLElement[]` not `Element[]`. Changed `runMermaid` parameter type accordingly.
- Added `aria-selected="false"` to `role="option"` buttons in `MermaidInsertButton.tsx` to satisfy `jsx-a11y/role-has-required-aria-props` ESLint rule.
- Updated `vitest.config.ts` to include `**/*.test.tsx` in addition to `**/*.test.ts` since the story's test file uses the `.tsx` extension.
- Fixed hydration mismatch in `MarkdownRenderer.tsx`: `DOMPurify.sanitize()` with `FORCE_BODY: true` returns empty string on the server side (isomorphic-dompurify/Node.js), causing `if (!html)` to render the placeholder SSR, which then mismatched the client rendering. Removed `FORCE_BODY: true` (and `ADD_TAGS`/`ADD_ATTR` options) since `div` and `class` are in DOMPurify's default allowlist and mermaid wrapper divs are preserved without them.

### Completion Notes List

- Installed `mermaid@11.12.3` via `pnpm add mermaid`. No approval issues — mermaid has no postinstall script.
- Created `lib/markdown/mermaid-setup.ts`: SSR-safe module with `initializeMermaid()` and `runMermaid()` exports. Reads 17 CSS custom properties at runtime via `getComputedStyle` for theming.
- Updated `lib/markdown/config.ts`: Added custom `renderer.code` that intercepts `lang === 'mermaid'` blocks and returns `<div class="mermaid-wrapper"><div class="mermaid">...</div></div>` with HTML-escaped source. Also fixed the `highlight()` fallback to return `code` (not `'plaintext'`) for unknown languages.
- Created `lib/markdown/mermaid-templates.ts`: 7 diagram templates (flowchart, sequence, class, state, er, gantt, pie) with Hebrew + English labels and `getMermaidTemplate()` helper.
- Updated `components/preview/MarkdownRenderer.tsx`: Added `containerRef`, `hasMermaidContent()` detector, `renderMermaidDiagrams()` async callback with `Promise.allSettled` for isolated per-diagram error handling. DOMPurify now configured with `ADD_TAGS: ['div']` and `ADD_ATTR: ['class']` to preserve mermaid wrapper divs.
- Created `components/editor/MermaidInsertButton.tsx`: Dropdown with 7 diagram types, outside-click dismissal, RTL-compatible positioning.
- Updated `components/editor/EditorTextarea.tsx`: Wrapped with `forwardRef<HTMLTextAreaElement>` to expose textarea DOM ref.
- Updated `components/editor/EditorPanel.tsx`: Added `textareaRef`, `insertTextAtCursor()` with cursor restore via `setTimeout`, integrated `MermaidInsertButton`.
- Added Mermaid CSS styles to `app/globals.css`: `.mermaid-wrapper` (LTR, centered, overflow scroll), `.mermaid-error`, `.mermaid-error-title`, `.mermaid-error-source` — all using 17-property CSS custom properties.
- Created `components/preview/MarkdownRenderer.test.tsx`: 9 tests covering `hasMermaidContent` detection, mermaid HTML output from `renderMarkdown`, XSS escaping, non-mermaid pass-through.
- All validations pass: `pnpm test` (16/16), `pnpm lint` (0 errors), `pnpm build` (successful).

### File List

- `package.json` — MODIFIED: added `mermaid@11.12.3` dependency
- `pnpm-lock.yaml` — MODIFIED: updated lockfile
- `lib/markdown/mermaid-setup.ts` — NEW: Mermaid initialization with theme variables
- `lib/markdown/mermaid-templates.ts` — NEW: 7 diagram template definitions
- `lib/markdown/config.ts` — MODIFIED: added mermaid renderer + fixed highlight() fallback
- `components/preview/MarkdownRenderer.tsx` — MODIFIED: useRef + useEffect + mermaid.run + DOMPurify config update
- `components/preview/MarkdownRenderer.test.tsx` — NEW: 9 unit tests
- `components/editor/MermaidInsertButton.tsx` — NEW: dropdown insert button
- `components/editor/EditorTextarea.tsx` — MODIFIED: wrapped with forwardRef
- `components/editor/EditorPanel.tsx` — MODIFIED: textareaRef + insertTextAtCursor + MermaidInsertButton
- `app/globals.css` — MODIFIED: Mermaid wrapper and error styles appended
- `vitest.config.ts` — MODIFIED: added `**/*.test.tsx` to include patterns
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED: status updated to review
- `_bmad-output/implementation-artifacts/1-3-mermaid-diagram-rendering.md` — MODIFIED: story updated

### Change Log

- 2026-03-06: Implemented Story 1.3 — Mermaid Diagram Rendering. Installed mermaid v11, created mermaid setup/templates modules, updated marked config with custom renderer, updated MarkdownRenderer with lazy-loaded diagram rendering, created MermaidInsertButton with 7 diagram types, added forwardRef to EditorTextarea, updated EditorPanel with cursor-aware insertion, added Mermaid CSS styles to globals.css. Fixed hljs plaintext fallback bug. 16 tests pass, build and lint clean.
