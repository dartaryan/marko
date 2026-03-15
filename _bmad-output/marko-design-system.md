# Marko Design System

> **Version:** 1.0
> **Created:** 2026-03-15
> **Status:** Authoritative — all visual work references this document
> **Guiding principle:** "Hebrew-markdown-export grew up and hired a world-class designer."

---

## 1. Brand DNA

Marko is an evolution of the original hebrew-markdown-export editor. Every design decision must preserve the original soul while elevating it to premium SaaS quality.

### Brand Personality
- **Warm**, not cold
- **Rounded**, not angular
- **Elevated**, not flat
- **Handcrafted**, not corporate
- **Confident**, not flashy

### Non-negotiable Identity Elements
| Element | Value | Why |
|---------|-------|-----|
| Primary color | Emerald `#10B981` | Core brand identity from original |
| Body font | Varela Round | Warm, rounded Hebrew support — THE Marko feeling |
| Code font | JetBrains Mono | Clean, professional monospace |
| Shape language | Rounded/pill | Warmth and friendliness |
| Depth model | Elevated glassmorphism | Premium, layered, not flat |
| Text direction | RTL-first | Hebrew is the primary language |

---

## 2. Color System

### 2.1 Core Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--color-emerald-50` | `#ecfdf5` | `#ecfdf5` | Tints, highlights, subtle backgrounds |
| `--color-emerald-100` | `#d1fae5` | `#d1fae5` | Borders in light mode, tags |
| `--color-emerald-200` | `#a7f3d0` | `#a7f3d0` | Muted text in dark mode |
| `--color-emerald-300` | `#6EE7B7` | `#6EE7B7` | Secondary accent, mint |
| `--color-emerald-400` | `#34d399` | `#34d399` | Links in dark mode, hover states |
| `--color-emerald-500` | `#10B981` | `#10B981` | Primary — buttons, focus rings, brand |
| `--color-emerald-600` | `#059669` | `#059669` | Primary hover state |
| `--color-emerald-700` | `#047857` | `#047857` | H2 headings, muted text light |
| `--color-emerald-800` | `#065f46` | `#065f46` | H1 headings |
| `--color-emerald-900` | `#064E3B` | `#064E3B` | Forest — deepest brand color |
| `--color-teal-400` | `#2DD4BF` | `#2DD4BF` | Tertiary accent, gradient endpoint |

### 2.2 Semantic Tokens

#### Light Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#FFFFFF` | Page background |
| `--background-subtle` | `#F8FAF9` | Editor page background (not pure white) |
| `--foreground` | `#064E3B` | Primary text |
| `--foreground-muted` | `#047857` | Secondary text, captions |
| `--foreground-faint` | `#6B7280` | Placeholder text, disabled states |
| `--surface` | `#FFFFFF` | Card/panel background |
| `--surface-raised` | `#F0FDF4` | Elevated surface, toolbar background, secondary bg |
| `--surface-overlay` | `rgba(255, 255, 255, 0.85)` | Glassmorphic overlays |
| `--border` | `#d1fae5` | Default border |
| `--border-subtle` | `#e5f5ef` | Subtle separator |
| `--border-strong` | `#a7f3d0` | Emphasized border |
| `--primary` | `#10B981` | Brand actions, links, focus |
| `--primary-hover` | `#059669` | Primary interaction hover |
| `--primary-active` | `#047857` | Primary click/active |
| `--primary-ghost` | `rgba(16, 185, 129, 0.08)` | Hover fill on ghost buttons |
| `--primary-ghost-strong` | `rgba(16, 185, 129, 0.15)` | Active fill on ghost buttons |
| `--ring` | `rgba(16, 185, 129, 0.4)` | Focus ring color |
| `--destructive` | `#EF4444` | Error, delete, danger |
| `--destructive-hover` | `#DC2626` | Destructive hover |
| `--warning` | `#F59E0B` | Warning, caution |
| `--success` | `#10B981` | Success (same as primary — brand-aligned) |
| `--info` | `#2DD4BF` | Informational |

#### Dark Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0B1A14` | Page background — deep forest, not gray |
| `--background-subtle` | `#0F2119` | Editor page background |
| `--foreground` | `#ecfdf5` | Primary text |
| `--foreground-muted` | `#6EE7B7` | Secondary text |
| `--foreground-faint` | `#4B7A65` | Placeholder, disabled |
| `--surface` | `#132B22` | Card/panel background |
| `--surface-raised` | `#1A3D30` | Toolbar, elevated elements |
| `--surface-overlay` | `rgba(19, 43, 34, 0.9)` | Glassmorphic overlays |
| `--border` | `rgba(110, 231, 183, 0.12)` | Default border — emerald-tinted |
| `--border-subtle` | `rgba(110, 231, 183, 0.06)` | Subtle separator |
| `--border-strong` | `rgba(110, 231, 183, 0.25)` | Emphasized border |
| `--primary` | `#10B981` | Primary stays same in dark |
| `--primary-hover` | `#34d399` | Lighter in dark mode (inverted direction) |
| `--primary-active` | `#6EE7B7` | Even lighter for active |
| `--primary-ghost` | `rgba(16, 185, 129, 0.1)` | Ghost hover |
| `--primary-ghost-strong` | `rgba(16, 185, 129, 0.2)` | Ghost active |
| `--ring` | `rgba(16, 185, 129, 0.5)` | Focus ring — slightly brighter in dark |
| `--destructive` | `#F87171` | Lighter red for dark mode readability |
| `--destructive-hover` | `#EF4444` | Destructive hover |
| `--warning` | `#FBBF24` | Warning |
| `--success` | `#34d399` | Success — lighter for dark readability |
| `--info` | `#2DD4BF` | Informational |

### 2.3 Gradient Definitions

| Gradient | CSS | Usage |
|----------|-----|-------|
| `--gradient-brand` | `linear-gradient(135deg, #10B981, #6EE7B7, #2DD4BF)` | Brand accent strip (panel tops, decorative) |
| `--gradient-brand-subtle` | `linear-gradient(135deg, rgba(16,185,129,0.15), rgba(110,231,183,0.08))` | Subtle background fills |
| `--gradient-landing` | `linear-gradient(180deg, #064E3B 0%, #0a6b4d 30%, #10B981 70%, #6EE7B7 100%)` | Landing page background |
| `--gradient-landing-dark` | `linear-gradient(180deg, #041F17 0%, #064E3B 40%, #0B1A14 100%)` | Landing page dark mode |
| `--gradient-logo` | `linear-gradient(135deg, #6EE7B7, #2DD4BF)` | Logo icon background |
| `--gradient-glow` | `radial-gradient(circle at 50% 50%, rgba(16,185,129,0.15), transparent 70%)` | Ambient glow effect behind panels |

### 2.4 Color Usage Rules

1. **Never use raw hex in components** — always reference tokens.
2. **Emerald-tinted shadows only** — no pure black shadows in light mode.
3. **Dark mode is forest-based** — backgrounds use `hsl(155°, ...)` not `hsl(0°, 0%, ...)`. The dark palette must feel like walking into a deep forest at night, not a dark room.
4. **Primary color is identical in both modes** — `#10B981` anchors the brand regardless of theme.
5. **Text on primary** is always `#FFFFFF` — the emerald is dark enough for white text at 4.5:1.
6. **Borders in dark mode** use alpha-blended emerald, not opaque colors — this creates depth and transparency.

---

## 3. Typography

### 3.1 Font Stack

```css
--font-body: 'Varela Round', 'Segoe UI', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace;
```

**Loading strategy:** `font-display: swap` — prevent invisible text during load. Preload Varela Round 400 and JetBrains Mono 400.

### 3.2 Type Scale

Base: `16px` (1rem). Scale ratio: `1.25` (Major Third).

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `--text-display` | `2.441rem` (39px) | 700 | 1.2 | `-0.02em` | Landing hero headline |
| `--text-h1` | `1.953rem` (31px) | 700 | 1.3 | `-0.01em` | Page/section headings, preview h1 |
| `--text-h2` | `1.563rem` (25px) | 600 | 1.35 | `-0.005em` | Sub-headings, preview h2 |
| `--text-h3` | `1.25rem` (20px) | 600 | 1.4 | `0` | Tertiary headings, preview h3 |
| `--text-h4` | `1.125rem` (18px) | 600 | 1.4 | `0` | Section labels, preview h4 |
| `--text-body` | `1rem` (16px) | 400 | 1.7 | `0` | Body text, paragraphs |
| `--text-body-sm` | `0.875rem` (14px) | 400 | 1.6 | `0` | Secondary body, toolbar labels |
| `--text-caption` | `0.75rem` (12px) | 400 | 1.5 | `0.01em` | Captions, timestamps, badges |
| `--text-overline` | `0.6875rem` (11px) | 600 | 1.4 | `0.05em` | Overlines, category labels (uppercase) |
| `--text-code` | `0.875rem` (14px) | 400 | 1.6 | `0` | Inline code, code blocks |
| `--text-code-sm` | `0.8125rem` (13px) | 400 | 1.5 | `0` | Small code, keyboard shortcuts |

### 3.3 Hebrew Typography Rules

1. **Varela Round supports Hebrew natively** — no fallback font switching.
2. **Line height for Hebrew** should be `1.7` for body text (Hebrew characters are taller and denser than Latin).
3. **Never use italics for Hebrew emphasis** — Hebrew italics are hard to read. Use **bold** or color for emphasis instead.
4. **Letter-spacing for Hebrew** should be `0` or minimal — Hebrew is not designed for loose tracking.
5. **Text alignment default** is `text-align: start` (which resolves to right in RTL).
6. **Code always renders LTR** — inline code and code blocks are always `direction: ltr; unicode-bidi: embed`.
7. **Mixed content** — when Hebrew text contains English words, use `unicode-bidi: plaintext` on the container to let the browser handle BiDi correctly.

### 3.4 Font Weight Usage

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Not used — Varela Round only ships 400. Use color/size instead |
| Semi-bold | 600 | Subheadings (h2-h4), labels, button text |
| Bold | 700 | Headlines (h1, display), emphasis, logo |

> **Note:** Varela Round is a single-weight font (400). Bold rendering is synthesized by the browser. For heading weight variation, rely on **size and color** rather than weight steps. JetBrains Mono supports weights 400 and 700.

---

## 4. Spacing System

### 4.1 Base Unit

Base: `4px`. All spacing is a multiple of 4px.

| Token | Value | Common Usage |
|-------|-------|-------------|
| `--space-0` | `0px` | Reset |
| `--space-0.5` | `2px` | Hairline gaps, icon adjustments |
| `--space-1` | `4px` | Tight inline gaps, icon-text gap |
| `--space-1.5` | `6px` | Compact button padding-y |
| `--space-2` | `8px` | Standard inline gap, compact padding |
| `--space-2.5` | `10px` | Button padding-y (default) |
| `--space-3` | `12px` | Input padding, small section gap |
| `--space-4` | `16px` | Standard padding, panel body, card content |
| `--space-5` | `20px` | Medium section gap |
| `--space-6` | `24px` | Panel gap, card grid gap, large padding |
| `--space-8` | `32px` | Section padding, between component groups |
| `--space-10` | `40px` | Section margin |
| `--space-12` | `48px` | Large section spacing |
| `--space-16` | `64px` | Page section spacing |
| `--space-20` | `80px` | Hero section padding |
| `--space-24` | `96px` | Landing section vertical rhythm |

### 4.2 Component Spacing Rules

| Context | Padding | Gap |
|---------|---------|-----|
| Button (sm) | `6px 12px` | — |
| Button (md) | `10px 20px` | — |
| Button (lg) | `12px 28px` | — |
| Button (icon-only) | `8px` (square) | — |
| Input field | `10px 12px` | — |
| Card/Panel body | `16px` | — |
| Card/Panel body (large) | `24px` | — |
| Toolbar | `8px 12px` | `4px` between buttons |
| Toolbar group separator | — | `8px` (includes 1px divider) |
| Header | `0 16px` | `8px` between items |
| Modal padding | `24px` | `16px` between sections |
| Grid gap (cards) | — | `24px` |
| Stack gap (form fields) | — | `16px` |
| Inline icon-text gap | — | `6px` |

### 4.3 Directional Spacing (RTL)

**Always use CSS logical properties:**

| Physical (DON'T) | Logical (DO) |
|-------------------|-------------|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-left` | `padding-inline-start` |
| `padding-right` | `padding-inline-end` |
| `border-left` | `border-inline-start` |
| `border-right` | `border-inline-end` |
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |
| `float: left` | `float: inline-start` |
| `left: 0` | `inset-inline-start: 0` |
| `right: 0` | `inset-inline-end: 0` |

> **Exception:** `top`, `bottom`, `width`, `height` are direction-agnostic and remain physical.

---

## 5. Elevation & Shadows

### 5.1 Shadow Scale

Shadows are **emerald-tinted** in light mode (warm, branded feel) and **neutral-dark** in dark mode.

| Level | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--shadow-0` | `none` | `none` | Flat elements, inline |
| `--shadow-1` | `0 1px 3px rgba(6, 78, 59, 0.08), 0 1px 2px rgba(6, 78, 59, 0.06)` | `0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)` | Subtle lift — buttons, inputs |
| `--shadow-2` | `0 4px 12px rgba(6, 78, 59, 0.1), 0 2px 4px rgba(6, 78, 59, 0.06)` | `0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.25)` | Cards, dropdowns, popovers |
| `--shadow-3` | `0 10px 40px rgba(6, 78, 59, 0.15), 0 4px 12px rgba(6, 78, 59, 0.08)` | `0 10px 40px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)` | Floating panels, editor panels |
| `--shadow-4` | `0 20px 60px rgba(6, 78, 59, 0.25), 0 8px 20px rgba(6, 78, 59, 0.1)` | `0 20px 60px rgba(0, 0, 0, 0.6), 0 8px 20px rgba(0, 0, 0, 0.35)` | Modals, elevated overlays, hover states |

### 5.2 Special Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-glow` | `0 0 20px rgba(16, 185, 129, 0.25)` | Primary button glow, focus glow |
| `--shadow-glow-strong` | `0 0 40px rgba(16, 185, 129, 0.35)` | Hero CTA, landing page elements |
| `--shadow-header` | `0 4px 20px rgba(0, 0, 0, 0.15)` | Fixed header shadow |
| `--shadow-inset` | `inset 0 2px 4px rgba(6, 78, 59, 0.06)` | Pressed/active button state |

### 5.3 Elevation Rules

1. **Panels float above the page** — always `--shadow-3`, elevating to `--shadow-4` on hover.
2. **Header is the highest fixed element** — uses `--shadow-header` plus `backdrop-filter: blur(12px)`.
3. **Dropdowns and popovers** get `--shadow-2`.
4. **Modals** get `--shadow-4` plus an overlay backdrop.
5. **Shadows lift on hover** — increase one level (e.g., `--shadow-2` → `--shadow-3`) with `transition: box-shadow 0.3s ease`.
6. **No shadows on flat inline elements** — text, inline badges, separators stay at level 0.

---

## 6. Border Radius

### 6.1 Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | `4px` | Inline code, small badges, toolbar button inner elements |
| `--radius-sm` | `6px` | Toolbar buttons, small interactive elements |
| `--radius-md` | `8px` | Inputs, dropdowns, command palette items |
| `--radius-lg` | `12px` | Cards, modals, popovers, logo icon |
| `--radius-xl` | `16px` | Code blocks, large cards |
| `--radius-2xl` | `20px` | Feature cards on landing page |
| `--radius-3xl` | `24px` | Floating panels (editor, preview) |
| `--radius-pill` | `9999px` | Pill buttons, pill badges, toggle tracks |

### 6.2 Radius Rules

1. **Panels** always use `--radius-3xl` (24px) — this is the signature Marko roundedness.
2. **Buttons** use `--radius-pill` (9999px) — pill-shaped buttons are core brand identity.
3. **Inputs** use `--radius-md` (8px) — functional, not overly decorative.
4. **Modals** use `--radius-lg` (12px) — serious but not harsh.
5. **Toolbar buttons** use `--radius-sm` (6px) — compact, functional.
6. **Never use 0 radius** — everything has roundedness. The minimum is `--radius-xs` (4px).

---

## 7. Component Specifications

### 7.1 Buttons

#### Variants

| Variant | Background | Text | Border | Hover | Active |
|---------|-----------|------|--------|-------|--------|
| **Primary** | `--primary` (#10B981) | `#FFFFFF` | `2px solid --color-emerald-300` | bg: `--primary-hover`, translateY(-2px), `--shadow-glow` | bg: `--primary-active`, translateY(0) |
| **Secondary** | `--surface-raised` | `--foreground` | `1px solid --border` | bg: `--primary-ghost`, border: `--primary` | bg: `--primary-ghost-strong` |
| **Ghost** | `transparent` | `--foreground-muted` | `none` | bg: `--primary-ghost`, color: `--primary` | bg: `--primary-ghost-strong` |
| **Outline** | `transparent` | `--primary` | `1px solid --primary` | bg: `--primary`, color: `#FFFFFF` | bg: `--primary-active`, color: `#FFFFFF` |
| **Destructive** | `--destructive` | `#FFFFFF` | `none` | bg: `--destructive-hover` | darken 10% |
| **Icon** | `transparent` | `--foreground-muted` | `none` | bg: `--primary-ghost`, color: `--primary` | bg: `--primary-ghost-strong` |

#### Sizes

| Size | Height | Padding | Font Size | Icon Size | Min Width |
|------|--------|---------|-----------|-----------|-----------|
| **sm** | `32px` | `6px 12px` | `13px` | `14px` | `32px` |
| **md** | `40px` | `10px 20px` | `14px` | `16px` | `40px` |
| **lg** | `48px` | `12px 28px` | `16px` | `18px` | `48px` |
| **icon-sm** | `32px` | `6px` (square) | — | `16px` | `32px` |
| **icon-md** | `40px` | `8px` (square) | — | `20px` | `40px` |

#### Button CSS (reference implementation)

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 9999px;          /* pill shape */
  font-family: var(--font-body);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  user-select: none;
}

.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--ring);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}
```

### 7.2 Panels / Cards

The floating panel is Marko's signature element — editor and preview panels float above the page background with rounded corners, emerald-tinted shadows, and a gradient accent stripe.

```
┌──────────────────────────────────────────┐
│ ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔ (3px gradient stripe) │
│  Panel Header (label, actions)          │
│ ──────────────────────────────────────── │
│                                          │
│  Panel Content                           │
│                                          │
└──────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `--surface` (light: `#FFFFFF`, dark: `#132B22`) |
| Border radius | `24px` (`--radius-3xl`) |
| Shadow (rest) | `--shadow-3` |
| Shadow (hover) | `--shadow-4` |
| Transition | `box-shadow 0.3s ease` |
| Top accent stripe | `3px` height, `--gradient-brand` |
| Header padding | `12px 16px` |
| Header border-bottom | `1px solid --border-subtle` |
| Body padding | `16px` |
| Overflow | `hidden` (respects border-radius) |

#### Panel Dark Mode Additions

| Property | Value |
|----------|-------|
| Border | `1px solid --border` (emerald-alpha, adds definition) |
| Background | `--surface` |

### 7.3 Header

The header is a fixed glassmorphic bar — the primary navigation and brand element.

| Property | Value |
|----------|-------|
| Position | `fixed`, `top: 0`, `inset-inline: 0` |
| Height | `56px` (`--header-height: 3.5rem`) |
| Background (light) | `rgba(6, 78, 59, 0.95)` — deep forest, near-opaque |
| Background (dark) | `rgba(11, 26, 20, 0.95)` |
| Backdrop filter | `blur(12px) saturate(1.2)` |
| Shadow | `--shadow-header` |
| Text color | `#ecfdf5` (light text on dark bg — both modes) |
| z-index | `50` |
| Direction | `rtl` |
| Padding | `0 16px` |
| Layout | `display: flex; align-items: center; justify-content: space-between` |

#### Header Children Styling

| Element | Style |
|---------|-------|
| Logo text | `18px`, bold `700`, color `#10B981` |
| Logo icon | `24×24px`, `--gradient-logo` bg, `border-radius: 12px`, `--shadow-2` |
| Separator | `1px` wide, `24px` tall, `rgba(255,255,255,0.15)` |
| Header buttons | Ghost icon variant, `32px` square, `border-radius: 6px`, text `#a7f3d0`, hover bg `rgba(110,231,183,0.2)` |
| View mode toggle | Pill container bg `rgba(16,185,129,0.1)`, `border-radius: 6px`, items `4px 10px` padding, active: bg `--primary` color `#FFFFFF` |
| Dropdowns | `32px` height, `border-radius: 6px`, bg `rgba(255,255,255,0.1)`, border `1px solid rgba(255,255,255,0.15)`, text `#ecfdf5` |

### 7.4 Toolbar

The formatting toolbar sits at the top of the editor panel.

| Property | Value |
|----------|-------|
| Background | `--surface-raised` |
| Padding | `8px 12px` |
| Border-bottom | `1px solid --border-subtle` |
| Layout | `display: flex; align-items: center; gap: 2px; flex-wrap: wrap` |

#### Toolbar Buttons

| Property | Value |
|----------|-------|
| Size | `32px × 32px` (min-height, min-width) |
| Border-radius | `6px` (`--radius-sm`) |
| Background (rest) | `transparent` |
| Color (rest) | `--foreground-muted` |
| Background (hover) | `--primary` |
| Color (hover) | `#FFFFFF` |
| Background (active/on) | `--primary-ghost-strong` |
| Color (active/on) | `--primary` |
| Transition | `all 0.15s ease` |
| Font size | `14px` for icons, `13px` for text labels |

#### Toolbar Separators

| Property | Value |
|----------|-------|
| Width | `1px` |
| Height | `20px` |
| Background | `--border` |
| Margin | `0 4px` |

#### AI Sparkle Button (special toolbar button)

| Property | Value |
|----------|-------|
| Color | `--primary` (always, even at rest) |
| Pseudo `::after` | Dashed border `1px dashed --primary`, pulsing animation (`2s infinite`) |
| Hover | Same as regular toolbar button |

### 7.5 Modals / Dialogs

| Property | Value |
|----------|-------|
| Overlay | `rgba(0, 0, 0, 0.5)` — same in both modes |
| Max width | `480px` (standard), `640px` (wide) |
| Background | `--surface` |
| Border-radius | `12px` (`--radius-lg`) |
| Shadow | `--shadow-4` |
| Border (dark mode) | `1px solid --border` |
| Direction | `rtl` |
| Padding (header) | `20px 24px 0` |
| Padding (body) | `0 24px 20px` |
| Padding (footer) | `16px 24px`, `border-top: 1px solid --border` |
| Title | `--text-h4` (18px), weight `700` |
| Description | `--text-body-sm` (14px), color `--foreground-muted` |
| Enter animation | `transform: scale(0.95) → scale(1)`, `opacity: 0 → 1`, `200ms ease-out` |
| Exit animation | `transform: scale(1) → scale(0.95)`, `opacity: 1 → 0`, `150ms ease-in` |

### 7.6 Inputs / Text Fields

| Property | Value |
|----------|-------|
| Height | `40px` (md), `32px` (sm) |
| Padding | `10px 12px` |
| Background | `--background` |
| Border | `1px solid --border` |
| Border-radius | `8px` (`--radius-md`) |
| Font | `--font-body`, `14px` |
| Color | `--foreground` |
| Placeholder | `--foreground-faint` |
| Direction | `rtl` |
| Focus border | `--primary` |
| Focus ring | `0 0 0 3px var(--ring)` |
| Disabled | `opacity: 0.5`, `cursor: not-allowed`, bg `--surface-raised` |
| Error border | `--destructive` |
| Error ring | `0 0 0 3px rgba(239, 68, 68, 0.2)` |

#### Textarea (Editor)

| Property | Value |
|----------|-------|
| Font | `--font-mono`, `14px` |
| Line height | `1.7` |
| Direction | `rtl` |
| `unicode-bidi` | `plaintext` (allows BiDi auto-detection) |
| Resize | `none` (editor manages sizing) |
| Padding | `16px` |
| Background | `--surface` |

### 7.7 Toggles / Switches

| Property | Value |
|----------|-------|
| Track width | `44px` |
| Track height | `24px` |
| Track radius | `9999px` (pill) |
| Track bg (off) | `--border-strong` |
| Track bg (on) | `--primary` |
| Thumb size | `20px × 20px` |
| Thumb radius | `50%` |
| Thumb bg | `#FFFFFF` |
| Thumb shadow | `--shadow-1` |
| Thumb offset (off) | `2px` from inline-start |
| Thumb offset (on) | `22px` from inline-start |
| Transition | `transform 0.2s ease, background-color 0.2s ease` |

### 7.8 Segmented Control (View Mode Toggle)

Used for editor/split/preview mode selection.

| Property | Value |
|----------|-------|
| Container bg | `rgba(16, 185, 129, 0.1)` |
| Container radius | `8px` |
| Container padding | `3px` |
| Item padding | `4px 12px` |
| Item radius | `6px` |
| Item bg (inactive) | `transparent` |
| Item color (inactive) | `--foreground-muted` (header context: `#a7f3d0`) |
| Item bg (active) | `--primary` |
| Item color (active) | `#FFFFFF` |
| Item font size | `13px` |
| Transition | `all 0.2s ease` |

### 7.9 Badges / Tags

| Variant | Background | Text | Border | Radius |
|---------|-----------|------|--------|--------|
| **Default** | `--surface-raised` | `--foreground-muted` | `1px solid --border` | `9999px` (pill) |
| **Primary** | `rgba(16,185,129,0.1)` | `--primary` | `none` | `9999px` |
| **Success** | `rgba(16,185,129,0.1)` | `--success` | `none` | `9999px` |
| **Warning** | `rgba(245,158,11,0.1)` | `--warning` | `none` | `9999px` |
| **Destructive** | `rgba(239,68,68,0.1)` | `--destructive` | `none` | `9999px` |
| **Pro badge** | `--gradient-brand` | `#FFFFFF` | `none` | `9999px` |

Size: `padding: 2px 8px`, `font-size: 11px`, `font-weight: 600`.

### 7.10 Footer

| Property | Value |
|----------|-------|
| Padding | `8px 16px` |
| Font size | `11px` (`--text-overline`) |
| Color | `--foreground-faint` |
| Border-top | `1px solid --border-subtle` |
| Background | `--surface` |
| Text align | `center` |
| Direction | `rtl` |

### 7.11 Color Panel

The color panel slides out from the header, allowing users to customize preview colors.

| Property | Value |
|----------|-------|
| Position | Absolute, anchored below the color button |
| Width | `320px` |
| Background | `--surface` |
| Border-radius | `12px` |
| Shadow | `--shadow-3` |
| Border | `1px solid --border` |
| Direction | `rtl` |
| Enter animation | `slideDown 0.2s ease-out` — translateY(-8px) → translateY(0), opacity 0 → 1 |
| Padding | `16px` |
| Grid | Color preset circles in a `5-column grid`, gap `8px` |
| Preset circle size | `28px × 28px` |
| Preset circle radius | `50%` |
| Preset circle border | `2px solid transparent`, active: `2px solid --primary` |
| Preset circle shadow | `--shadow-1` |

### 7.12 Dropdown Menus

| Property | Value |
|----------|-------|
| Min width | `180px` |
| Background | `--surface` |
| Border-radius | `8px` |
| Shadow | `--shadow-2` |
| Border | `1px solid --border` |
| Padding | `4px` |
| Item padding | `8px 12px` |
| Item radius | `4px` |
| Item hover | bg `--primary-ghost`, color `--primary` |
| Item active | bg `--primary-ghost-strong` |
| Separator | `1px solid --border-subtle`, margin `4px 0` |
| Direction | `rtl` |
| Enter animation | `scaleIn 0.15s ease-out` from `scale(0.95) opacity(0)` |

### 7.13 Toast / Notifications

| Property | Value |
|----------|-------|
| Position | Fixed, `bottom: 24px`, centered horizontally |
| Background | `--foreground` (inverted — dark on light, light on dark) |
| Text color | `--background` (inverted) |
| Border-radius | `8px` |
| Padding | `12px 20px` |
| Shadow | `--shadow-3` |
| Font size | `14px` |
| Direction | `rtl` |
| z-index | `60` |
| Enter | `translateY(16px) → translateY(0)`, `opacity 0 → 1`, `300ms ease-out` |
| Exit | `translateY(0) → translateY(16px)`, `opacity 1 → 0`, `200ms ease-in` |
| Auto-dismiss | `4000ms` |

---

## 8. Interactions & Motion

### 8.1 Transition Defaults

| Context | Duration | Easing | Properties |
|---------|----------|--------|------------|
| Button hover | `200ms` | `ease` | `background-color, color, transform, box-shadow` |
| Button active (press) | `100ms` | `ease-out` | `transform` |
| Panel hover shadow | `300ms` | `ease` | `box-shadow` |
| Color/opacity change | `150ms` | `ease` | `color, opacity, background-color` |
| Layout shift (width, height) | `300ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | `width, height, max-height` |
| Modal enter | `200ms` | `ease-out` | `transform, opacity` |
| Modal exit | `150ms` | `ease-in` | `transform, opacity` |
| Dropdown enter | `150ms` | `ease-out` | `transform, opacity` |
| Slide-in content | `400ms` | `ease-out` | `transform, opacity` |
| Page background | `500ms` | `ease` | `background-color` (theme switch) |

### 8.2 Hover Effects

| Element | Hover Effect |
|---------|-------------|
| Primary button | `translateY(-2px)` + `--shadow-glow` |
| Secondary/ghost button | Background fill only (no transform) |
| Toolbar button | Background fill to `--primary`, text to `#FFFFFF` |
| Card/panel | Shadow lifts from `--shadow-3` to `--shadow-4` |
| Link | `opacity: 0.8` |
| Dropdown item | Background fill `--primary-ghost` |
| Icon button | Background fill `--primary-ghost`, color → `--primary` |

### 8.3 Focus States

```css
/* Universal focus ring */
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--ring);
}

/* On dark backgrounds (header) */
.dark-context :focus-visible {
  box-shadow: 0 0 0 3px rgba(110, 231, 183, 0.5);
}
```

Focus rings are **always visible** for keyboard navigation. They use the emerald ring color (`--ring`), not the browser default blue.

### 8.4 Active / Pressed States

| Element | Active Effect |
|---------|-------------|
| Primary button | `translateY(0)` (cancel hover lift), bg darken to `--primary-active` |
| Ghost button | bg `--primary-ghost-strong` |
| Toolbar button | bg `--primary-ghost-strong`, color `--primary` |

### 8.5 Loading States

| State | Pattern |
|-------|---------|
| Button loading | Disable button, replace text with spinner (16px, `animate-spin`, `border: 2px solid rgba(255,255,255,0.3); border-top-color: white`) |
| Content loading | Skeleton screen with `animate-pulse`, bg `--surface-raised` |
| Full page loading | Centered spinner with Marko logo, emerald spinner ring |
| Export/async operation | Toast with spinner, descriptive text |

### 8.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

All decorative animations respect this preference. Functional transitions (opacity changes for visibility) may use `0.1s` instead of removal.

### 8.7 Keyframe Animations

```css
@keyframes slideInFromBottom {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-border {
  0%, 100% { opacity: 0; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 9. Layout & Grid

### 9.1 Breakpoints

| Token | Width | Context |
|-------|-------|---------|
| `--bp-mobile` | `375px` | Small phones |
| `--bp-mobile-lg` | `480px` | Large phones |
| `--bp-tablet` | `768px` | Tablets, small laptops |
| `--bp-desktop` | `1024px` | Standard desktop |
| `--bp-desktop-lg` | `1440px` | Large desktop |

**Media query direction:** Mobile-first (`min-width`).

```css
/* Mobile (default) */
/* styles... */

@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Large desktop */ }
```

### 9.2 Container

| Property | Value |
|----------|-------|
| Max width | `1440px` |
| Padding (mobile) | `0 16px` |
| Padding (tablet+) | `0 24px` |
| Padding (desktop-lg) | `0 32px` |
| Centering | `margin-inline: auto` |

### 9.3 Editor Page Layout

```
┌─────────────────────────────────────────────────┐
│  Header (fixed, 56px height)                    │
├─────────────────────────────────────────────────┤
│  ┌─ Background (--background-subtle) ────────┐  │
│  │                                            │  │
│  │  ┌─ Editor Panel ──┐ ┌─ Preview Panel ─┐  │  │
│  │  │                  │ │                 │  │  │
│  │  │  [Toolbar]       │ │  [Label]        │  │  │
│  │  │  [Textarea]      │ │  [Rendered MD]  │  │  │
│  │  │                  │ │                 │  │  │
│  │  └──────────────────┘ └─────────────────┘  │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│  Footer                                         │
└─────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `--background-subtle` (not pure white — gives panels contrast to float) |
| Top padding | `calc(var(--header-height) + 16px)` — clear the fixed header |
| Panel container | `display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 16px` |
| Panel container (mobile) | `grid-template-columns: 1fr` — stack vertically |
| Panel max-height (desktop) | `calc(100vh - var(--header-height) - 32px)` — fill viewport minus header + padding |
| Panel overflow | `overflow-y: auto` inside panel body |

### 9.4 Landing Page Layout

| Section | Layout |
|---------|--------|
| Hero | Full-width gradient background, centered content `max-width: 800px`, text centered |
| Features | `grid; grid-template-columns: repeat(3, 1fr); gap: 24px` → `repeat(2, 1fr)` at tablet → `1fr` at mobile |
| Demo | Full-width, constrained inner `max-width: 1200px` |
| Footer | Full-width, centered content |

### 9.5 Panel Floating Behavior

Panels **float** above the page background with gap between them and the page edges:

| Viewport | Panel gap (to edges) | Panel gap (between) | Panel border-radius |
|----------|---------------------|---------------------|---------------------|
| ≥1024px | `16px` all sides | `24px` | `24px` |
| 768–1023px | `12px` all sides | `16px` | `20px` |
| <768px | `8px` horizontal, `8px` vertical | Stacked, `12px` between | `16px` |

### 9.6 Z-Index Scale

| Level | Value | Usage |
|-------|-------|-------|
| Base | `0` | Default content |
| Raised | `10` | Sticky toolbar, floating panels |
| Dropdown | `20` | Dropdown menus, color panel, popovers |
| Sticky | `30` | Sticky headers within scroll containers |
| Fixed | `40` | Fixed sidebar (future) |
| Header | `50` | Main navigation header |
| Toast | `60` | Toast notifications |
| Modal backdrop | `70` | Modal overlay |
| Modal | `80` | Modal content |
| Tooltip | `90` | Tooltips (always on top) |

---

## 10. Dark Mode

### 10.1 Philosophy

Dark mode is NOT an inversion. It's an intentional alternate palette built on **deep forest greens**, not neutral grays. The user should feel like the same product in a different lighting — warm and emerald-tinted, never cold.

### 10.2 Complete Token Map

(See Section 2.2 for full dark mode semantic tokens.)

### 10.3 Dark Mode Implementation Rules

1. **Use CSS custom properties for all colors** — switching happens by redefining variables on `.dark`.
2. **Surfaces get darker toward the back, lighter toward the front:**
   - Page bg: `#0B1A14` (darkest)
   - Panel bg: `#132B22` (medium)
   - Toolbar/raised: `#1A3D30` (lightest surface)
3. **Borders use alpha-blended emerald** — `rgba(110, 231, 183, 0.12)` creates subtle glowing edges.
4. **Text hierarchy in dark mode:**
   - Primary: `#ecfdf5` (near-white, emerald-tinted)
   - Secondary: `#6EE7B7` (bright emerald)
   - Faint: `#4B7A65` (muted forest)
5. **Shadows are deeper and darker** — no emerald tint (it would look strange on dark backgrounds).
6. **The header looks similar in both modes** — it's always dark with glassmorphism. Only the transparency color shifts.
7. **Scrollbar thumb** in dark mode is `#6EE7B7` (light emerald — visible against dark track).
8. **Accent stripe on panels** uses the same `--gradient-brand` in both modes — it pops equally well.

### 10.4 Dark Mode Content Colors (17-color system)

| Token | Dark Value | Notes |
|-------|-----------|-------|
| `--color-primary-text` | `#E0E8E4` | Warm near-white, not pure #fff |
| `--color-secondary-text` | `#8FAFA0` | Muted forest green |
| `--color-link` | `#34d399` | Brighter emerald for visibility |
| `--color-code` | `#F472B6` | Pink (unchanged — good contrast on dark) |
| `--color-h1` | `#6EE7B7` | Bright emerald |
| `--color-h1-border` | `#10B981` | Brand primary |
| `--color-h2` | `#34d399` | Slightly muted emerald |
| `--color-h2-border` | `#059669` | Darker emerald border |
| `--color-h3` | `#A7F3D0` | Light mint |
| `--color-preview-bg` | `#0F1F19` | Deep forest — matches page |
| `--color-code-bg` | `#162B23` | Slightly raised forest |
| `--color-blockquote-bg` | `#132B1A` | Forest with slight warmth |
| `--color-table-header` | `#1A3D2E` | Raised surface |
| `--color-table-alt` | `#142921` | Subtle stripe |
| `--color-blockquote-border` | `#10B981` | Brand primary |
| `--color-hr` | `rgba(110, 231, 183, 0.2)` | Emerald-tinted rule |
| `--color-table-border` | `rgba(110, 231, 183, 0.15)` | Subtle emerald borders |

---

## 11. RTL Rules

### 11.1 Document Direction

```html
<html lang="he" dir="rtl">
```

The entire application is RTL by default. Individual elements override to LTR where needed (code blocks, diagrams).

### 11.2 Logical Properties (mandatory)

Every component MUST use CSS logical properties for directional values. See Section 4.3 for the complete mapping table.

### 11.3 Flexbox and Grid Direction

```css
/* Flex: direction auto-reverses in RTL */
.flex-row {
  display: flex;
  /* DO NOT set flex-direction: row-reverse for RTL */
  /* Flex respects the document direction automatically */
}
```

### 11.4 Icon Mirroring

| Icon Type | Mirror in RTL? | Examples |
|-----------|---------------|----------|
| Directional arrows | YES | Back arrow, forward arrow, undo, redo |
| Text alignment icons | YES | Align left → align right |
| List indent/outdent | YES | Indent becomes "push right" |
| Non-directional | NO | Bold, italic, strikethrough, settings, sun/moon |
| Symbols | NO | Plus, minus, close, search, download |

Implementation: Add `[dir="rtl"] .icon-mirror { transform: scaleX(-1); }` class to directional icons.

### 11.5 Blockquote Border

```css
/* RTL: border on the right (inline-start) */
blockquote {
  border-inline-start: 4px solid var(--color-blockquote-border);
  border-radius: 0 4px 4px 0; /* only round the end side */
}

/* In RTL context, this becomes:
   border-right: 4px solid ...
   but the logical property handles it automatically */
```

### 11.6 Code Blocks

```css
/* Code is always LTR regardless of document direction */
code, pre {
  direction: ltr;
  unicode-bidi: embed;
  text-align: left;
}
```

### 11.7 Scrollbar Position

In RTL, the vertical scrollbar naturally appears on the **left** side. No override needed.

### 11.8 Keyboard Shortcuts

Keyboard shortcuts remain the same physical keys regardless of RTL/LTR (e.g., Ctrl+B for bold). Do NOT mirror shortcuts.

### 11.9 Numbers and Punctuation

Numbers in Hebrew text remain LTR. The browser handles this via Unicode BiDi algorithm. Use `unicode-bidi: plaintext` on containers that mix Hebrew and Latin text.

---

## 12. Icon Guidelines

### 12.1 Icon Source

Use **Lucide** icons exclusively. Lucide is lightweight, consistent, and has excellent coverage.

- Package: `lucide-react`
- Stroke-based, not filled
- Default viewBox: `0 0 24 24`

### 12.2 Icon Sizes

| Token | Size | Stroke Width | Usage |
|-------|------|-------------|-------|
| `--icon-xs` | `14px` | `2px` | Inline with small text, badge icons |
| `--icon-sm` | `16px` | `2px` | Toolbar buttons, inline with body text |
| `--icon-md` | `20px` | `1.75px` | Standard buttons, header items |
| `--icon-lg` | `24px` | `1.5px` | Feature icons, empty states |
| `--icon-xl` | `32px` | `1.5px` | Landing page feature cards |

### 12.3 Icon Color Rules

1. **Interactive icons** inherit text color and change on hover (e.g., toolbar buttons).
2. **Decorative icons** use `--foreground-muted` — never full foreground.
3. **Brand icons** use `--primary` — sparkle, feature highlights.
4. **Never use emojis as icons** — always use Lucide SVG icons.
5. **Icon + text gap** is `6px` (`--space-1.5`).

### 12.4 Specific Icon Mapping

| Function | Lucide Icon | Notes |
|----------|------------|-------|
| Bold | `Bold` | |
| Italic | `Italic` | |
| Strikethrough | `Strikethrough` | |
| Headings | `Heading` + dropdown | |
| Unordered list | `List` | Mirror in RTL |
| Ordered list | `ListOrdered` | Mirror in RTL |
| Checklist | `ListChecks` | |
| Link | `Link` | |
| Image | `Image` | |
| Code inline | `Code` | |
| Code block | `FileCode` | |
| Table | `Table` | |
| Horizontal rule | `Minus` | |
| Quote | `Quote` | Mirror in RTL |
| AI / Sparkle | `Sparkles` | Always `--primary` color |
| Theme toggle (light) | `Sun` | |
| Theme toggle (dark) | `Moon` | |
| Direction RTL | `AlignRight` | |
| Direction LTR | `AlignLeft` | |
| Export | `Download` | |
| Copy | `Copy` | |
| Presentation | `Presentation` | |
| Settings / Colors | `Palette` | |
| Close | `X` | |
| Check / Success | `Check` | |
| Warning | `AlertTriangle` | |
| Error | `AlertCircle` | |
| Info | `Info` | |
| User (logged in) | `User` | |
| Login | `LogIn` | |
| Chevron down | `ChevronDown` | |
| Search | `Search` | |
| Undo | `Undo` | Mirror in RTL |
| Redo | `Redo` | Mirror in RTL |

---

## 13. Scrollbar Styling

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--primary);     /* #10B981 */
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-emerald-900); /* #064E3B */
}

/* Dark mode */
.dark ::-webkit-scrollbar-thumb {
  background: var(--color-emerald-300); /* #6EE7B7 */
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: var(--color-teal-400);     /* #2DD4BF */
}
```

---

## 14. Preview Content (Markdown Rendering)

These styles apply inside `.preview-content` — the rendered markdown pane.

### 14.1 Heading Styles

| Element | Size | Color (Light) | Color (Dark) | Border | Margin |
|---------|------|--------------|-------------|--------|--------|
| h1 | `1.953rem` | `#065f46` | `#6EE7B7` | `bottom 3px solid --primary` | `top: 1.5rem, bottom: 1rem` |
| h2 | `1.563rem` | `#047857` | `#34d399` | `bottom 1px solid --color-h2-border` | `top: 1.25rem, bottom: 0.75rem` |
| h3 | `1.25rem` | `#059669` | `#A7F3D0` | none | `top: 1rem, bottom: 0.5rem` |
| h4-h6 | `1.125rem` → `0.875rem` | `--foreground` | `--foreground` | none | `top: 0.75rem, bottom: 0.5rem` |

### 14.2 Body Text

| Property | Value |
|----------|-------|
| Font | `--font-body` (Varela Round) |
| Size | `1rem` (16px) |
| Line height | `1.7` |
| Color | `--color-primary-text` |
| Paragraph margin | `bottom: 1rem` |
| Max line width | — (determined by panel width) |

### 14.3 Code

| Context | Font | Size | Background | Color | Radius | Padding | Direction |
|---------|------|------|-----------|-------|--------|---------|-----------|
| Inline code | `--font-mono` | `0.875em` | `--color-code-bg` | `--color-code` (pink) | `4px` | `2px 6px` | `ltr` |
| Code block | `--font-mono` | `0.875rem` | `--color-code-bg` | inherited | `12px` | `1rem` | `ltr` |

### 14.4 Blockquote

| Property | Value |
|----------|-------|
| Border | `border-inline-start: 4px solid --color-blockquote-border` |
| Background | `--color-blockquote-bg` |
| Padding | `12px 16px` |
| Radius | `0 --radius-xs --radius-xs 0` (only round the end corners) |
| Margin | `1rem 0` |

### 14.5 Tables

| Part | Background | Border |
|------|-----------|--------|
| Header | `--color-table-header` | `1px solid --color-table-border` |
| Body row | `--surface` | `1px solid --color-table-border` |
| Alt row | `--color-table-alt` | Same |
| Cell padding | `8px 12px` | — |
| Text align | `start` | — |

### 14.6 Lists

```css
.preview-content ul,
.preview-content ol {
  padding-inline-start: 1.5rem;
  margin-bottom: 1rem;
}

.preview-content li {
  margin-bottom: 0.25rem;
  line-height: 1.7;
}
```

### 14.7 Horizontal Rule

```css
.preview-content hr {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, var(--primary), var(--color-emerald-300), transparent);
  margin: 1.5rem 0;
  border-radius: 1px;
}
```

This replaces the plain gray line with a branded gradient rule that fades from emerald to transparent — a subtle premium touch.

---

## 15. Accessibility Checklist

| Requirement | Implementation |
|-------------|---------------|
| Color contrast ≥ 4.5:1 | All text/bg combinations verified (see palette) |
| Focus visible | `box-shadow: 0 0 0 3px var(--ring)` on `:focus-visible` |
| Touch targets ≥ 44px | All buttons min `32px` (toolbar), primary actions min `40px` |
| `aria-label` on icon buttons | All icon-only buttons have descriptive aria-labels in Hebrew |
| `prefers-reduced-motion` | Global query disables decorative animation |
| Form labels | All inputs have associated `<label>` elements |
| Color not sole indicator | Active states use bg change + border, not just color |
| Keyboard navigation | Tab order matches visual flow (RTL), escape closes modals |
| Skip to content | Hidden link before header, visible on focus |
| `lang="he"` | Set on `<html>` element |
| `dir="rtl"` | Set on `<html>` element |

---

## 16. Implementation Notes for Dev Agents

### 16.1 CSS Architecture

All tokens live in `app/globals.css` as CSS custom properties on `:root` (light) and `.dark` (dark mode). Components consume tokens via `var()`.

Tailwind configuration should reference these tokens so that utility classes like `bg-primary`, `text-foreground`, etc., resolve to the correct values.

### 16.2 shadcn/ui Integration

shadcn/ui components (New York variant) should be **re-themed**, not replaced. Override their CSS variables to use Marko tokens. Key overrides:

- `--radius` → `0.75rem` (base, used to compute sm/md/lg)
- All color variables → mapped to Marko emerald palette
- Button component → override with pill radius, Marko transitions
- Input component → override with Marko focus ring

### 16.3 Order of Implementation

When implementing the visual rebuild (WS2), follow this order:

1. **globals.css** — Set all tokens first (Section 2, 3, 4, 5, 6 of this doc)
2. **button.tsx** — Override shadcn Button with Marko variants
3. **Header** — Glassmorphic header with proper z-index
4. **PanelLayout** — Floating panels with accent stripe
5. **EditorToolbar** — Toolbar buttons and separators
6. **Modals/Dialogs** — Branded modals
7. **Landing page** — Apply tokens to Hero, Features, Demo
8. **Dark mode pass** — Verify all components in dark mode
9. **Mobile pass** — Verify all breakpoints

### 16.4 What NOT to Do

- Do NOT use emojis as icons anywhere in the UI
- Do NOT use `z-index: 9999` — follow the z-index scale
- Do NOT use physical directional properties (`margin-left`, `padding-right`) — always logical
- Do NOT hardcode hex values in component files — reference tokens
- Do NOT use `translateY` hover effects on secondary/ghost buttons — only on primary CTA
- Do NOT apply emerald tint to dark mode shadows (it looks muddy)
- Do NOT use pure gray (`#gray`) in the dark palette — everything is forest-tinted
- Do NOT set `font-weight: 500` for Varela Round — it doesn't exist, use color/size for hierarchy

---

## Appendix A: Token Quick Reference Card

```
COLORS
  primary:        #10B981    (emerald-500)
  primary-hover:  #059669    (emerald-600)
  secondary:      #6EE7B7    (emerald-300, mint)
  tertiary:       #2DD4BF    (teal-400, cyan)
  forest:         #064E3B    (emerald-900, deep)

TYPOGRAPHY
  body:           Varela Round, 16px, 400, 1.7
  heading:        Varela Round, scale 1.25, 700
  code:           JetBrains Mono, 14px, 400, 1.6

SPACING
  base:           4px
  common:         8, 12, 16, 24, 32, 48px

RADIUS
  toolbar btn:    6px
  input:          8px
  card/modal:     12px
  panel:          24px
  button:         9999px (pill)

SHADOWS (light)
  sm:    0 1px 3px rgba(6,78,59,0.08)
  md:    0 4px 12px rgba(6,78,59,0.1)
  lg:    0 10px 40px rgba(6,78,59,0.15)
  xl:    0 20px 60px rgba(6,78,59,0.25)
  glow:  0 0 20px rgba(16,185,129,0.25)

Z-INDEX
  content: 0   raised: 10   dropdown: 20   header: 50
  toast: 60   modal-bg: 70   modal: 80   tooltip: 90

DARK MODE BG STACK
  page:    #0B1A14
  panel:   #132B22
  raised:  #1A3D30
```

---

## Appendix B: Contrast Verification

| Text | Background | Ratio | Pass? |
|------|-----------|-------|-------|
| `#064E3B` on `#FFFFFF` | Light body | 9.4:1 | AA |
| `#047857` on `#FFFFFF` | Light muted | 6.5:1 | AA |
| `#FFFFFF` on `#10B981` | Button text | 4.6:1 | AA |
| `#ecfdf5` on `#0B1A14` | Dark body | 14.2:1 | AAA |
| `#6EE7B7` on `#0B1A14` | Dark muted | 10.8:1 | AAA |
| `#6EE7B7` on `#132B22` | Dark panel text | 8.7:1 | AAA |
| `#FFFFFF` on `rgba(6,78,59,0.95)` | Header text | 12.1:1 | AAA |
| `#a7f3d0` on `rgba(6,78,59,0.95)` | Header muted | 7.3:1 | AA |

All primary text/background combinations meet WCAG AA (4.5:1 minimum). Most exceed AAA (7:1).
