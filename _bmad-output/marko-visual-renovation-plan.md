# Marko Visual Renovation Plan

## Instructions for the AI Agent

**What is this document?** This is a complete knowledge base and action plan for fixing the visual identity and design of the Marko site. BenAkiva (the project owner) created it after completing Sprint 1 and discovering that the built site lost the soul and personality of the original site.

**How to use this document:**
1. Read this ENTIRE document before starting any work
2. Follow the phases in order (A -> B -> C -> D)
3. Each phase has specific, actionable tasks with file paths and CSS values
4. After each phase, do a visual check with Hawk (Playwright MCP) before moving to the next
5. Do NOT skip the original site reference — it defines the target aesthetic
6. The UI/UX Pro Max skill (`/ui-ux-pro-max`) is available for design guidance and implementation

**Context:** Marko is a Next.js SaaS upgrade of BenAkiva's original single-file Hebrew Markdown editor at https://dartaryan.github.io/hebrew-markdown-export/. All 34 stories across 9 epics were implemented, but the result looks generic and doesn't resemble the original. The API (Convex, Clerk, Stripe, Anthropic) is also not connected yet.

---

## The Problem: What Went Wrong

### 1. Visual Identity Lost
The original site has a **distinctive, warm, handcrafted personality**. The rebuilt site uses shadcn/ui defaults (New York variant) which look clean but **generic** — like any SaaS template.

### 2. API Not Connected
Backend services (Convex, Clerk, Stripe, Anthropic Claude) exist as code but aren't wired to real credentials/services.

### 3. Design Soul Missing
The original felt like a **curated product with character**. The rebuild feels like a **developer prototype**.

---

## Original Site Design DNA (The Target)

Reference: https://dartaryan.github.io/hebrew-markdown-export/

### Color Palette
| Token | Hex | Role |
|-------|-----|------|
| Primary | `#10B981` | Emerald green — main action color |
| Secondary | `#6EE7B7` | Light mint — highlights, gradients |
| Accent | `#2DD4BF` | Cyan/teal — gradient endpoints, accents |
| Dark | `#064E3B` | Deep forest — text, header background |
| Darker | `#022c22` | Very dark teal — deepest background |
| Surface | `#F0FDF4` | Pale green tint — panel backgrounds |
| Border | `#d1fae5` | Light emerald border |
| Border Light | `#ecfdf5` | Lightest border |
| Code BG | `#0d1117` | GitHub-dark code background |
| Text Muted | `#6B7280` | Gray for secondary info |

#### Dark Mode
| Token | Hex |
|-------|-----|
| Background | `#0f1f1a` |
| Surface | `#132520` |
| Foreground | `#ecfdf5` |

### Typography
| Element | Font | Notes |
|---------|------|-------|
| Body | **Varela Round** | Rounded, geometric, friendly — THIS IS THE SOUL OF THE ORIGINAL |
| Code | **JetBrains Mono** | Same as current (keep) |

**CRITICAL:** The current site uses **Noto Sans Hebrew** which is professional but generic. The original's warmth comes largely from **Varela Round**. This is the single biggest personality difference.

### Border Radius (Generous, Rounded)
| Element | Value | Current Marko |
|---------|-------|---------------|
| Panels | `24px` | Uses shadcn default (~10px) |
| Buttons | `25px` (pill-shaped) | Uses shadcn default (~6px) |
| Code blocks | `16px` | `0.5rem` (8px) |
| Tables | `12px` | None |
| Logo icon | `12px` | None |
| Modals | `16px` | shadcn default |
| Small elements | `6-8px` | Similar |

### Shadows (Deep, Emerald-Tinted)
| Element | Value | Current Marko |
|---------|-------|---------------|
| Card default | `0 10px 40px rgba(6, 78, 59, 0.15)` | `shadow-sm` (tiny) |
| Card hover | `0 20px 60px rgba(6, 78, 59, 0.25)` | `shadow-md` (still small) |
| Header | `0 4px 20px rgba(0, 0, 0, 0.2)` | None (just border-b) |
| Logo icon | `0 4px 12px rgba(110, 231, 183, 0.3)` | None |
| Dark card default | `0 10px 40px rgba(0, 0, 0, 0.4)` | N/A |
| Dark card hover | `0 20px 60px rgba(0, 0, 0, 0.5)` | N/A |

### Visual Effects (Glassmorphism, Gradients)
| Effect | CSS | Current Marko |
|--------|-----|---------------|
| Header blur | `backdrop-filter: blur(10px); background: rgba(6, 78, 59, 0.95)` | Plain white with border-b |
| Body gradient | `linear-gradient(180deg, var(--dark) 0%, #0a6b4d 50%, var(--primary) 100%)` | Plain white |
| Panel top accent | `linear-gradient(90deg, var(--primary), var(--secondary), var(--accent))` — a thin colored stripe at the top of panels | None |
| Logo gradient | `linear-gradient(135deg, var(--secondary), var(--accent))` | None |
| HR gradient | `linear-gradient(90deg, var(--primary), var(--secondary), transparent)` | Solid border |
| Action bar blur | `backdrop-filter: blur(5px)` | None |

### Animations & Transitions
| Animation | Value | Current Marko |
|-----------|-------|---------------|
| Button hover | `transform: translateY(-2px)` | `active:scale-[0.97]` (too subtle) |
| Modal open | `transform: scale(0.9) -> scale(1)` | shadcn defaults |
| Slide in | `slideInFromBottom 0.4s ease-out` | None |
| General transitions | `all 0.3s ease` | `transition-colors` only |
| Toast slide | `translateY(100px) -> translateY(0)` | sonner defaults |

### Scrollbar Styling
```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--dark); }
```
Current Marko: No custom scrollbar styling.

### Key Layout Differences
| Aspect | Original | Current Marko |
|--------|----------|---------------|
| Header | Dark emerald (`rgba(6, 78, 59, 0.95)`) with blur, floating feel | White with `border-b` — flat, boring |
| Body background | Rich gradient (dark -> emerald -> green) | Plain `bg-background` (white) |
| Panel containers | Rounded (24px), elevated shadows, top gradient accent stripe | Flat, minimal border |
| Buttons | Pill-shaped (25px radius), bold colors, hover lift | Tiny rounded corners, minimal feedback |
| Editor/Preview labels | Styled with surface background | Just text with `text-muted-foreground` |
| Toolbar | Colored background, larger buttons, hover = primary color | Minimal, small 28px buttons |
| Footer/Action bar | Blurred glassmorphic background | Plain footer with border |

---

## Current Marko Architecture (What We're Working With)

### Tech Stack
- **Framework:** Next.js 16.1.6 + React 19.2.3 + TypeScript
- **Backend:** Convex (serverless) — NOT CONNECTED
- **Auth:** Clerk — NOT CONNECTED
- **Payments:** Stripe — NOT CONNECTED
- **AI:** Anthropic Claude — NOT CONNECTED
- **Styling:** Tailwind CSS 4 + shadcn/ui (New York) + CSS custom properties
- **Fonts:** Noto Sans Hebrew (body), JetBrains Mono (code)
- **Icons:** lucide-react

### Key Files to Modify
| File | What to Change |
|------|---------------|
| `app/layout.tsx` | Font: Noto Sans Hebrew -> Varela Round |
| `app/globals.css` | Add gradients, shadows, glassmorphism, scrollbar, animations; override shadcn theme tokens with emerald palette |
| `components/layout/Header.tsx` | Dark glassmorphic header with gradient logo |
| `components/layout/PanelLayout.tsx` | Add panel styling (rounded corners, shadows, accent stripe) |
| `components/editor/EditorPanel.tsx` | Styled editor container, toolbar background |
| `components/preview/PreviewPanel.tsx` | Styled preview container |
| `components/landing/Hero.tsx` | Gradient background, warmer styling, bigger personality |
| `components/landing/Features.tsx` | Card styling with emerald shadows, hover effects |
| `components/landing/Demo.tsx` | Panel styling matching editor aesthetic |
| `components/editor/EditorToolbar.tsx` | Larger buttons, colored hover, toolbar background |
| `components/editor/FormatButton.tsx` | Pill or rounded styling, hover lift |
| `components/export/ExportModal.tsx` | Rounded modal, emerald accents |
| `components/theme/ColorPanel.tsx` | Styled slide-out panel |
| `components/auth/*.tsx` | Styled auth components |
| `components/ui/button.tsx` | Override shadcn button with pill shape, emerald variants |

---

## Phase A: Font & Core Identity (Do First — Biggest Impact)

### A1. Replace Noto Sans Hebrew with Varela Round

**File:** `app/layout.tsx`

**Current:**
```typescript
import { Noto_Sans_Hebrew, JetBrains_Mono } from "next/font/google";

const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-body",
});
```

**Change to:**
```typescript
import { Varela_Round, JetBrains_Mono } from "next/font/google";

const varelaRound = Varela_Round({
  weight: "400", // Varela Round only has 400 weight
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-body",
});
```

**Also update the body className** to use `varelaRound.variable` instead of `notoSansHebrew.variable`.

**NOTE:** Varela Round only comes in weight 400. For bold text, rely on the browser's synthetic bold or consider using a complementary bold font for headings. Test to make sure Hebrew renders well.

### A2. Override shadcn Theme Tokens with Emerald Palette

**File:** `app/globals.css`

Replace the shadcn `:root` color tokens to inject the emerald personality:

```css
:root {
  --radius: 0.75rem; /* Increase from 0.625rem */

  /* shadcn/ui variables — EMERALD IDENTITY */
  --background: #FFFFFF;
  --foreground: #064E3B;
  --card: #FFFFFF;
  --card-foreground: #064E3B;
  --popover: #FFFFFF;
  --popover-foreground: #064E3B;
  --primary: #10B981;
  --primary-foreground: #FFFFFF;
  --secondary: #F0FDF4;
  --secondary-foreground: #064E3B;
  --muted: #F0FDF4;
  --muted-foreground: #047857;
  --accent: #ecfdf5;
  --accent-foreground: #064E3B;
  --destructive: oklch(0.577 0.245 27.325);
  --border: #d1fae5;
  --input: #d1fae5;
  --ring: #10B981;
}
```

And dark mode:
```css
.dark, [data-theme="dark"] {
  --background: #0f1f1a;
  --foreground: #ecfdf5;
  --card: #132520;
  --card-foreground: #ecfdf5;
  --popover: #132520;
  --popover-foreground: #ecfdf5;
  --primary: #10B981;
  --primary-foreground: #FFFFFF;
  --secondary: #1a2e25;
  --secondary-foreground: #ecfdf5;
  --muted: #1a2e25;
  --muted-foreground: #6EE7B7;
  --accent: #1a2e25;
  --accent-foreground: #ecfdf5;
  --border: rgba(110, 231, 183, 0.15);
  --input: rgba(110, 231, 183, 0.2);
  --ring: #10B981;
}
```

---

## Phase B: Visual Effects & Layout (The "Wow" Factor)

### B1. Body Background Gradient

**File:** `app/globals.css` — add to `body` or the landing page wrapper:

```css
/* Landing page gradient background */
.landing-gradient {
  background: linear-gradient(180deg, #064E3B 0%, #0a6b4d 30%, #10B981 70%, #6EE7B7 100%);
  min-height: 100vh;
}
```

The editor page should NOT have this gradient — it should use the clean `--background` color. Only the landing page gets the dramatic gradient.

### B2. Glassmorphic Header

**File:** `components/layout/Header.tsx`

Replace the current `className` on `<header>`:
```
Current:  "flex h-14 items-center justify-between border-b border-border px-4"
Target:   Dark emerald glassmorphic header with blur and shadow
```

New header styling:
```css
/* In globals.css */
.marko-header {
  background: rgba(6, 78, 59, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  color: #ecfdf5;
}
```

Also add a logo icon with gradient background:
```css
.marko-logo-icon {
  background: linear-gradient(135deg, #6EE7B7, #2DD4BF);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(110, 231, 183, 0.3);
}
```

### B3. Panel Styling (Editor & Preview)

Add to `globals.css`:
```css
.marko-panel {
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(6, 78, 59, 0.15);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.marko-panel:hover {
  box-shadow: 0 20px 60px rgba(6, 78, 59, 0.25);
}

/* Top accent stripe on panels */
.marko-panel::before {
  content: '';
  display: block;
  height: 3px;
  background: linear-gradient(90deg, #10B981, #6EE7B7, #2DD4BF);
}

.dark .marko-panel {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

.dark .marko-panel:hover {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
```

Apply to `PanelLayout.tsx` children or create wrapper divs.

### B4. Button Styling Override

**File:** `components/ui/button.tsx` or `globals.css`

Buttons need to be pill-shaped with hover lift:
```css
/* Pill buttons with lift effect */
.btn-marko {
  border-radius: 25px;
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-marko:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
```

Or override the shadcn button variants to use rounded-full and add the hover transform globally.

### B5. Toolbar Styling

**File:** `components/editor/EditorToolbar.tsx`

Current toolbar buttons are 28x28px minimal icons. Make them:
- Background: `var(--surface)` / `#F0FDF4`
- Larger: 32x32px minimum
- Hover: background becomes `#10B981`, text becomes white
- Border radius: 6px
- Toolbar container: background surface color, padding `0.75rem 1rem`

### B6. Custom Scrollbar

Add to `globals.css`:
```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #10B981;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #064E3B;
}

.dark ::-webkit-scrollbar-thumb {
  background: #6EE7B7;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #2DD4BF;
}
```

### B7. Animation Enhancements

Add to `globals.css`:
```css
@keyframes slideInFromBottom {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in {
  animation: slideInFromBottom 0.4s ease-out;
}

/* Modal scale animation */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}
```

---

## Phase C: Landing Page Personality

### C1. Hero Section Overhaul

**File:** `components/landing/Hero.tsx`

Current: Plain white background, centered text, basic CTA button.
Target: Dramatic gradient background, larger personality, floating feel.

Key changes:
- Wrap in gradient background (emerald -> teal)
- CTA button: pill-shaped, white text on emerald, hover lift + glow shadow
- Add subtle floating animation or decorative elements
- Make the heading more dramatic with text shadow or gradient text

### C2. Features Section Cards

**File:** `components/landing/Features.tsx`

Current: `rounded-xl border border-border bg-card p-6 shadow-sm`
Target: Deep emerald-tinted shadows, hover lift, accent stripe, 24px radius

```
rounded-3xl bg-card p-8 shadow-[0_10px_40px_rgba(6,78,59,0.15)]
hover:shadow-[0_20px_60px_rgba(6,78,59,0.25)] hover:-translate-y-1
transition-all duration-300
```

Icon containers: bigger, gradient background instead of `bg-primary/10`.

### C3. Demo Section

**File:** `components/landing/Demo.tsx`

The demo panel should look like the actual editor — apply `marko-panel` styling with the accent stripe, rounded corners, and deep shadows.

### C4. Footer

Current: Plain `border-t` footer.
Target: Glassmorphic or gradient footer matching the landing page vibe.

---

## Phase D: Editor Page Polish

### D1. Header in Editor Context
Same glassmorphic header but with all the action buttons styled consistently.

### D2. Editor Textarea Area
- Surface background color (`#F0FDF4`)
- Custom scrollbar
- Comfortable padding
- Styled focus ring (emerald)

### D3. Preview Panel Content
The preview content styling in `globals.css` is already decent (uses the 17-color system). Main improvements:
- Code blocks: increase border-radius from `0.5rem` to `16px` (1rem)
- Blockquotes: increase border-radius, add subtle shadow
- Tables: add border-radius to container
- HR: gradient instead of solid

### D4. Color Panel
The slide-out color panel should use the glassmorphic effect and feel premium.

### D5. Export Modal
Rounded corners (16px), emerald accent on primary actions, scale-in animation.

---

## Phase E: API Connection (Separate Workstream)

This is NOT a visual task but is critical for the site to function:

### E1. Convex Backend
- Set up Convex project and get deployment URL
- Add `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` to `.env.local`
- Deploy Convex functions

### E2. Clerk Authentication
- Create Clerk application
- Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- Configure Clerk webhook to Convex

### E3. Stripe Payments
- Set up Stripe account with Israeli tax settings
- Add `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- Create subscription products/prices

### E4. Anthropic Claude AI
- Add `ANTHROPIC_API_KEY`
- Configure model routing (Haiku free, Sonnet paid, Opus premium)

### E5. Sumit Integration (Israeli Receipts)
- Set up Sumit account
- Add `SUMIT_API_KEY` credentials

---

## Phase F: Hawk Visual QA Verification

After visual fixes are applied, run a full Hawk verification:

1. **Install Playwright MCP** — `claude mcp add playwright -- npx @playwright/mcp@latest`
2. **Start the dev server** — `pnpm dev` on localhost:3000
3. **Invoke Hawk** — `/bmad-hawk` then choose `[VD] Verify Done`
4. Hawk will screenshot every page at all breakpoints (375, 768, 1024, 1440)
5. Compare against the original site's aesthetic
6. Generate findings report with dev-ready fix prompts

### Verification Checklist
- [ ] Font is Varela Round (not Noto Sans Hebrew)
- [ ] Header is dark emerald with glassmorphic blur
- [ ] Body/landing has gradient background
- [ ] Panels have 24px radius and deep shadows
- [ ] Buttons are pill-shaped with hover lift
- [ ] Feature cards have emerald-tinted shadows
- [ ] Scrollbars are custom styled (emerald)
- [ ] Animations are smooth (slide-in, scale-in)
- [ ] Dark mode uses emerald dark palette (not gray)
- [ ] RTL layout is correct everywhere
- [ ] Hebrew text renders beautifully in Varela Round
- [ ] Code blocks use JetBrains Mono with 16px radius
- [ ] Color presets still work correctly
- [ ] Toolbar is styled with surface background and colored hover
- [ ] Export modal is rounded and polished
- [ ] Landing page feels warm and distinctive (not generic)
- [ ] Editor page feels like the original upgraded (familiar evolution)
- [ ] No mixed language bugs (all UI text in Hebrew where expected)

---

## Recommended Execution Order

1. **Phase A** (Font + Colors) — 30 min, biggest visual impact
2. **Phase B** (Effects + Layout) — Use `/ui-ux-pro-max` for implementation
3. **Phase C** (Landing Page) — Use `/ui-ux-pro-max` for design guidance
4. **Phase D** (Editor Polish) — Incremental improvements
5. **Phase F** (Hawk QA) — After each phase, quick visual check
6. **Phase E** (API) — Can be done in parallel, separate workstream

---

## Tools Available

| Tool | Purpose |
|------|---------|
| `/ui-ux-pro-max` | Design intelligence — 67 styles, 96 palettes. Use for design decisions, implementation guidance, and code generation |
| `/bmad-hawk` | Visual QA — screenshots, bug detection, findings reports (requires Playwright MCP) |
| `/bmad-dev` | Development agent — for implementing code changes |
| `/bmad-quick-dev-new-preview` | Quick implementation of changes |

---

## Key Principle

> The goal is NOT to make a new design. The goal is to bring the ORIGINAL site's personality into the new architecture. Every design decision should ask: "Does this feel like hebrew-markdown-export upgraded, or does it feel like a generic SaaS template?"

The answer must always be the former.
