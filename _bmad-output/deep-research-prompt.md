# Deep Research Prompt — Marko Editor UI/UX Benchmarking

> **Ready to paste directly into Deep Research (ChatGPT, Perplexity, or Gemini)**
> Copy everything below the line.

---

## Comprehensive UI/UX Benchmarking Study for a Hebrew-First Markdown Editor

I need an ultimate, comprehensive UI/UX benchmarking study for **Marko** — a Hebrew-first freemium markdown editor being rebuilt into a premium SaaS product. Marko lets users paste/type markdown text, see a live styled preview, customize document colors, export to PDF/HTML/Word, and (premium) use AI to act on their documents (summarize, translate, generate diagrams, etc.).

**Key constraints that make Marko unique:**
- **Hebrew-first, RTL interface** — primary users are Hebrew speakers; the UI must be natively RTL
- **Markdown editor with live preview** — split-view: raw markdown on one side, rendered output on the other
- **Warm, rounded, emerald-green brand** — not corporate or flat; uses Varela Round font, pill-shaped buttons, glassmorphic panels
- **Freemium model** — AI features are the paid differentiator; free tier covers all formatting/export features
- **Target users:** Hebrew-speaking professionals, students, content creators who need fast document formatting

---

### Research Objectives

Answer these 8 questions with **specific, actionable findings** — not general UX theory. For every recommendation, cite a real product and show exactly how they do it.

---

### AREA 1: Editor Toolbar & Button Organization

**Question:** How do the best web-based editors organize toolbar buttons when they have 15–25+ features, and how do they balance "powerful" with "clean"?

**Analyze these products specifically:**
- Notion (block-based editor, `/` command palette)
- Google Docs (traditional toolbar)
- Craft.do (clean markdown-style editor)
- Dropbox Paper (minimal toolbar)
- Typora (markdown editor with hidden source)
- Hemingway Editor (ultra-minimal)
- Coda.io (docs + tables + automation)

**Extract for each:**
1. How many buttons/icons are visible in the default toolbar at 1440px? At 768px?
2. What is the grouping logic — by function (text | insert | layout), by frequency, or by workflow stage?
3. Where is their "star feature" placed (AI, collaboration, etc.)? How visually distinct is it from other buttons?
4. What gets hidden — in menus, dropdowns, `/` command palette, or keyboard shortcuts only?
5. How does the toolbar adapt on mobile (collapse, hamburger, bottom bar, hidden)?
6. Do they use icon-only, text-only, or icon+text buttons? At what breakpoint does this change?

**Deliverable:** A comparison table of all 7 products, then a **recommended toolbar architecture** for an editor with these features: Bold/Italic/Strike, Headings (H1-H6), Lists (3 types), Insert (link, image, table, horizontal rule), Code (inline + block), Mermaid diagrams, AI assistant, Export, Copy, Color themes, Dark mode, Direction (RTL/LTR/BiDi), Sample document, Clear, Presentation mode, View mode toggle.

---

### AREA 2: RTL / Hebrew-First Interface Patterns

**Question:** How do production Hebrew and Arabic web applications handle RTL layout, panel direction, toolbar mirroring, and mixed-direction content?

**Analyze these products specifically:**
- Wix Editor (Israeli company — their editor interface in Hebrew mode)
- monday.com (Israeli company — Hebrew UI)
- Elementor (Israeli company — WordPress builder)
- Fiverr (Israeli company — marketplace interface in Hebrew)
- Google Docs in Hebrew mode (how does toolbar mirror?)
- Any Arabic document/note-taking tool you can find

**Extract for each:**
1. Which side do slide-out panels/sidebars open from in RTL mode? (Left or right?)
2. Where is the user menu/avatar positioned? (Left corner or right corner?)
3. How do they handle mixed Hebrew/English text in forms, labels, and inputs?
4. Which icons get mirrored for RTL (arrows, checkmarks, progress indicators)?
5. How do they handle number inputs and hex codes within an RTL form?
6. Where do action buttons sit in modals/dialogs (left side or right side in RTL)?

**Deliverable:** A clear set of **RTL layout rules** — which side for panels, which side for user menu, which icons mirror, how to handle mixed-direction form labels. Include screenshots or detailed descriptions of how each product handles these.

---

### AREA 3: Document Color Theme / Styling UX

**Question:** How do the best tools let users customize document appearance while preventing ugly results?

**Analyze these products specifically:**
- Canva (Brand Kit, document themes, color palette system)
- Google Slides (theme picker)
- Bear (macOS/iOS writing app — known for beautiful curated themes)
- iA Writer (minimalist document styling)
- Notion (page covers, icons, font choices)
- Obsidian (community themes)
- VS Code (theme system — how do they present 1000+ themes without overwhelm?)

**Extract for each:**
1. How many built-in themes do they offer?
2. Do they show visual preview thumbnails? What does the preview look like?
3. Do they allow full custom colors? If yes, how do they prevent garish results (constraints, harmony rules, warnings)?
4. If they use curated-only themes, how do they organize/categorize them?
5. Is there a "preview before apply" mechanism?
6. How do they handle the advanced/power-user need to tweak individual colors?

**Deliverable:** A recommended **theme system architecture** for Marko: how many themes, how to present them, whether to allow custom colors, and how to organize the color panel UI. Include 3–5 example theme concepts (name, color palette, intended mood).

---

### AREA 4: Landing Page & First-Time Experience for Productivity Tools

**Question:** How do premium productivity tools handle their landing page, first-time onboarding, and the transition from "marketing site" to "product"?

**Analyze these products specifically:**
- Linear.app (famous for beautiful landing animations)
- Raycast (product showcase landing page)
- Pitch.com (presentation tool — how they demo the editor)
- Framer.com (landing page with heavy animations that still performs well)
- Arc Browser (introduces a complex tool simply)
- Superhuman (email tool — onboarding experience)
- Craft.do (landing → editor flow)

**Extract for each:**
1. Does the landing page use video, animation, interactive demo, or static screenshots to showcase the product?
2. What is the performance impact of their animations? (Check Lighthouse scores or PageSpeed if possible)
3. Do returning users skip the landing page and go straight to the product? How?
4. How do they handle first-time vs. returning user experience?
5. What's their CTA (call to action) structure — single button, multiple paths?
6. How do they balance "show the product" with "don't overwhelm new users"?

**Deliverable:** A recommended **landing page strategy** for Marko: what to show, what animation approach to use, how to handle first-visit vs. return-visit, and 2–3 specific layout/content ideas. Include performance considerations.

---

### AREA 5: AI Feature Prominence in Editor UIs

**Question:** How do AI-powered editors present their AI capabilities — and specifically, how do they make the AI feature feel like the star of the product without cluttering the editing experience?

**Analyze these products specifically:**
- Notion AI (inline AI, command palette)
- Cursor (code editor with AI at the center)
- Lex.page (AI writing assistant)
- Jasper (AI content creation)
- Grammarly (integrated AI suggestions)
- GitHub Copilot in VS Code (inline AI completions)
- ChatGPT canvas mode (document + AI interaction)

**Extract for each:**
1. Where is the AI entry point — toolbar button, floating button, keyboard shortcut, `/` command, right-click menu, or always-visible sidebar?
2. How visually prominent is the AI button compared to other buttons? (Size, color, icon, position)
3. What happens when the user activates AI — modal, inline dropdown, command palette, sidebar, or inline streaming text?
4. How do they differentiate "AI feature" from "regular feature" visually?
5. Do they use a command palette (Ctrl+K / Cmd+K)? What does it look like?
6. How do they upsell free users to the AI premium tier? What does the paywall look like?

**Deliverable:** A recommended **AI integration pattern** for Marko: where to put the AI button, how to make it prominent, what the AI interaction flow should look like, and how to handle the free → paid conversion moment.

---

### AREA 6: Lightweight Document Management

**Question:** How do simple document/note tools handle "my saved documents" for logged-in users without building a full file-system UI?

**Analyze these products specifically:**
- HackMD / CodiMD (collaborative markdown editor)
- StackEdit (online markdown editor with sync)
- Standard Notes (minimalist encrypted notes)
- Simplenote (bare-minimum notes app)
- Craft.do (document organization)
- Notion (page/document tree)
- Bear (note organization with tags)

**Extract for each:**
1. Is the document list a sidebar, dropdown, separate page, or modal?
2. What metadata is shown for each document (title, date, preview snippet, tags, word count)?
3. How does save work — auto-save, manual save button, or save-on-exit?
4. How do they handle "untitled" or "new" documents?
5. What's the minimum UI that still feels complete?
6. How do they handle search/filter across documents?

**Deliverable:** A recommended **minimum viable document management** design for Marko: what UI pattern (dropdown, sidebar, or modal), what info to show per document, and how save/load should work. Keep it minimal — Marko is not Notion.

---

### AREA 7: Logo Design — Letter Integrated with Writing Tool

**Question:** Find real examples of logos where a letter (Hebrew, Arabic, or Latin) is visually integrated with a pen, pencil, or writing instrument — specifically where a stroke of the letter becomes the writing tool.

**Search for:**
- Israeli tech company logos that use Hebrew letters
- Logos where a letter stroke becomes a pen/pencil nib
- Writing/editor app logos (how do iA Writer, Bear, Ulysses, Typora handle their logo?)
- Calligraphy/typography brand logos
- Logo design case studies about letter-object integration

**Extract:**
1. How is the transition from letter to pencil/pen handled — gradual, clean break, overlap?
2. Does the concept work at small sizes (16px favicon)? What simplifications are needed?
3. Flat design or with depth (gradient, shadow)?
4. How does it adapt for dark vs. light backgrounds? Monochrome version?
5. What color approach — single color, gradient, or multi-color?

**Deliverable:** A description of 5–8 real-world logo examples that achieve this effect, with analysis of what works and what doesn't. Then a **creative brief** for Marko's logo: the Hebrew letter "מ" (Mem) where the straight vertical stroke (the right side of the letter) transitions into a pencil, in emerald green brand colors. Include specifications for sizes (favicon 16px, header 32px, landing page 128px+) and color variants.

---

### AREA 8: Lightweight Landing Page Animation Approaches

**Question:** What is the most performant way to add impressive, product-showcasing animations to a landing page built with Next.js and React?

**Compare these approaches:**
- **CSS-only animations** (keyframes, transitions, scroll-driven animations)
- **Lottie** (vector animation via JSON, rendered in canvas/SVG)
- **Rive** (interactive animation runtime)
- **GSAP + ScrollTrigger** (JavaScript animation library)
- **Framer Motion** (React animation library — already common in Next.js projects)
- **Pre-rendered video (WebM/MP4)** (export from After Effects, Remotion, etc.)
- **Remotion** (React-based video generation)

**For each approach, extract:**
1. Bundle size impact (KB added to the page)
2. CPU/GPU usage during animation
3. Can it be lazy-loaded to avoid blocking initial page render?
4. Complexity to implement for a developer (easy / medium / hard)
5. Visual quality ceiling (what's the best it can look?)
6. Can it handle the specific demo we want — a document preview cycling through color themes?

**Deliverable:** A ranked comparison table (performance vs. visual quality vs. complexity), then a **specific recommendation** for Marko's landing page: which approach, what kind of animation (cycling color themes on a document mockup), and rough implementation plan.

---

### Research Strategy

Use a **pattern extraction** approach:
1. For each area, examine all listed products and extract the specific UI decisions they made
2. Identify **convergent patterns** — where 4+ products make the same choice, that's likely a proven pattern
3. Identify **divergent innovations** — where one product does something unique and effective
4. For each area, synthesize a **specific recommendation for Marko** that considers: Hebrew RTL layout, warm/rounded brand personality, freemium model with AI as the premium hook, and the need to feel "bulky/substantial" not thin/minimal

### Evaluation Criteria

For every recommendation, evaluate against these criteria:
- **Fit for Hebrew/RTL:** Does this pattern work when the entire interface is mirrored?
- **Fit for Marko's brand:** Does this feel warm, rounded, and substantial — not cold, angular, or minimal?
- **Technical feasibility:** Can a small team implement this in a Next.js + React + Tailwind stack?
- **User friction:** Does this reduce the time from "open Marko" to "have a finished document"?
- **Business impact:** Does this help convert free users to paid (AI feature)?

### Expected Output

Produce a **single structured report** with:
1. **Per-area findings table** — what each product does, with specifics (not vague descriptions)
2. **Per-area recommendation** — exactly what Marko should do, citing which product(s) inspired it
3. **Cross-cutting insights** — patterns that affect multiple areas (e.g., "all successful editors hide 60%+ of features behind menus")
4. **Priority matrix** — which recommendations have the highest impact for the lowest implementation effort
5. **Visual references** — link to or describe specific UI screenshots/screens that Marko should study

### Custom Instructions

- Be extremely specific — "a dropdown menu" is not enough; say "a dropdown triggered by a pill-shaped button in the top-right of the toolbar, 320px wide, showing the 8 most recent documents with title + relative date + first-line preview, with a pinned 'New document' action at the top"
- Focus on 2024–2026 products and patterns — avoid outdated references
- Every recommendation must end with a concrete **"For Marko, this means..."** action statement
- If you cannot find information about a specific product, say so and substitute a comparable alternative
- Prioritize products that have strong RTL/internationalization — their patterns are more directly applicable
- Include performance data where available (Lighthouse scores, bundle sizes)
