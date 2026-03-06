---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments: ['_bmad-output/project-context.md', 'docs/index.md', 'docs/project-overview.md', 'docs/source-tree-analysis.md', 'docs/architecture.md', 'docs/component-inventory.md', 'docs/development-guide.md', 'docs/hebrew-markdown-export-improvements.md']
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 8
classification:
  projectType: 'SaaS (freemium PWA with backend services)'
  domain: 'Productivity / Developer Tools'
  complexity: 'medium'
  projectContext: 'brownfield'
workflowType: 'prd'
lastEdited: '2026-03-06'
editHistory:
  - date: '2026-03-06'
    changes: 'Validation-driven edits: removed implementation leakage from FRs/NFRs (6), replaced subjective adjectives with testable criteria (3), added specific metrics to scalability NFRs (3), fixed traceability gap (1), improved FR format and specificity (2)'
---

# Product Requirements Document - Marko

**Author:** BenAkiva
**Date:** 2026-03-06

## Executive Summary

Marko is a Hebrew-first smart document companion that evolves from an existing, well-loved Markdown editor (hebrew-markdown-export v1.3.0) into a freemium SaaS platform. Users paste or type text, get instant beautifully-rendered output with full RTL support, and — in the premium tier — leverage contextual AI to act on their documents: translate sections, extract action items, draft replies, generate diagrams, and more.

The product targets Hebrew-speaking professionals, students, and content creators who need fast, polished document formatting without the overhead of heavyweight tools like Google Docs or Notion. The free tier preserves everything the current user base already relies on. Paid features earn their price by turning static documents into interactive, intelligent workspaces.

Marko is part of a broader ecosystem: future integration with Mike (a transcription agent by the same creator) creates a voice-to-structured-document pipeline — Mike transcribes, Marko formats and enriches.

### What Makes This Special

- **Hebrew-native bilingual intelligence:** Auto-detects Hebrew vs English per sentence and adjusts text direction (RTL/LTR) automatically. No other Markdown tool handles this natively.
- **Simplicity with hidden depth:** The UI stays clean and minimal — paste and go. Power features are accessible but never clutter the core experience. The toolbar must remain simple even as capabilities grow.
- **AI as contextual document assistant:** Not a chatbot bolted on — the AI understands what your document is and proposes relevant actions: summarize, translate a section, generate a flowchart, suggest action items, draft a response email. Inspired by NotebookLM, scoped to a single document.
- **Trust-first monetization:** Free users never lose what they have. Premium features are genuinely valuable additions, not paywalled basics. Affordable pricing ensures the AI costs are covered while keeping the tool accessible.
- **Beautiful output, instantly:** Users consistently cite speed and visual quality as the reasons they love the tool. Exports (PDF, HTML, Word) preserve styling, RTL direction, and custom color themes.

## Project Classification

- **Project Type:** SaaS — freemium PWA with backend services (auth, payments, AI API proxy, analytics)
- **Domain:** Productivity / Developer Tools
- **Complexity:** Medium — authentication, payment processing (Israeli tax/receipt compliance), AI integration with per-call costs, usage analytics, and a platform migration from single-file SPA to a modern framework
- **Project Context:** Brownfield — evolving an existing v1.3.0 open-source tool with an active user base into a commercial freemium product

## Success Criteria

### User Success

- Users paste or type content and see beautifully rendered output in under 1 second — the core speed promise is maintained
- Free users experience zero degradation from what they have today — all existing features remain available without login
- First-time AI usage creates a "wow" moment — the quality of output on their specific document convinces them this is worth paying for
- The UI feels familiar and fun — existing users recognize Marko as an evolution, not a replacement
- Bilingual auto-detection works seamlessly — users stop manually toggling RTL/LTR

### Business Success

- **3-month target:** Validate willingness to pay. At least some percentage of active users convert to paid after experiencing the free AI trial
- **12-month target:** Marko is self-sustaining — paid subscriptions cover AI API costs, hosting, and development time
- **Retention signal:** No measurable drop in free-tier usage after introducing paid features. Zero "you ruined it" feedback
- **Discovery:** Marko appears on the first page of Google results for relevant Hebrew Markdown / document tool searches
- **Pricing model:** Needs research — evaluate freemium AI cadence (weekly, 4x/month, daily) and subscription price points against competitors and AI cost per call

### Technical Success

- Platform migration completed without breaking existing functionality
- AI agent integration is reliable, fast (response under 10s), and cost-efficient per call
- Authentication and payment system works smoothly with Israeli tax/receipt compliance
- Analytics pipeline captures user logins, feature usage, AI call frequency, and conversion events from day one
- SEO fundamentals in place: proper meta tags, server-side rendering for crawlers, sitemap, structured data

### Measurable Outcomes

- Free-to-paid conversion rate (target TBD after pricing research)
- AI feature usage rate among free users (measures the hook effectiveness)
- Monthly active users (free + paid) — growth trend
- Average AI calls per paying user per month (informs cost modeling)
- Google Search impressions and click-through rate for target Hebrew keywords
- Zero increase in churn among pre-existing free users after v2 launch

## User Journeys

### Journey 1: Noa — The Paste-and-Present Professional

**Who:** Noa, 34, project manager at a tech company in Tel Aviv. She constantly receives Markdown output from AI tools (ChatGPT, Claude, Copilot) and developer docs. She doesn't write Markdown — she consumes it.

**Opening Scene:** Noa just got a long AI-generated project summary in Markdown. It's a wall of raw text with `##` headers, `**bold**`, and bullet points. She needs to present this to her team in 15 minutes.

**Rising Action:** She opens Marko, pastes the content. Instantly, it renders beautifully — Hebrew text flows right-to-left, English code snippets align left, headings are colored and clear. She switches to preview-only mode. The document looks polished and professional.

**Climax:** She connects her laptop to the meeting room screen and uses presentation mode — the content fills the screen, large and readable. Her team is impressed. One colleague asks "where did you make this?" After the meeting, she exports to PDF with one click and emails it to the team.

**Resolution:** Marko becomes Noa's go-to tool whenever she gets Markdown from anywhere. She signs up for free. One day she uses the AI to translate a section to English for an international stakeholder — the quality is perfect. She hits the free limit and pays without hesitation.

**Requirements revealed:** Paste-first UX, instant render, presentation/reading mode, PDF export with RTL, bilingual auto-detection, AI translation

### Journey 2: Yuval — The Developer Who Writes in Hebrew

**Who:** Yuval, 28, full-stack developer. He writes technical documentation and READMEs in Hebrew for his team. He knows Markdown well but hates how most editors butcher Hebrew RTL.

**Opening Scene:** Yuval is writing a technical spec. He needs headers, code blocks, Mermaid diagrams, and Hebrew prose to coexist without fighting each other directionally.

**Rising Action:** He finds Marko via Google search. The landing page is clean and speaks to him immediately. He starts typing — Hebrew text goes right, code blocks stay left, Mermaid diagrams render inline. He customizes the color theme to match his company brand using the image color extraction.

**Climax:** He exports to HTML, sends it to his team lead. It looks exactly like the preview — colors, RTL, diagrams, everything preserved. His team lead asks him to extract action items from the spec. Yuval clicks the AI button — Claude reads the document and generates a bullet-point task list in Hebrew. Done in seconds.

**Resolution:** Yuval registers, becomes a paying user for the AI features. He starts using Marko for all his documentation. He recommends it to his team.

**Requirements revealed:** SEO/discoverability, code + Hebrew coexistence, Mermaid diagrams, color themes, HTML export, AI action extraction, registration flow

### Journey 3: Dana — The Existing v1 User Who Encounters v2

**Who:** Dana, 41, content writer. She's been using hebrew-markdown-export weekly for 6 months. She loves it — simple, fast, beautiful. She bookmarked it and never looked back.

**Opening Scene:** Dana opens her bookmark and sees "Marko" — the tool looks familiar but refreshed. A subtle banner says "Welcome to Marko — everything you love, now with more." All her saved color settings are preserved.

**Rising Action:** She pastes her latest article draft as usual. Everything works exactly as before — same speed, same beautiful preview. She notices a small sparkle icon in the toolbar. She clicks it — "Ask Marko AI" — and types "summarize this in 3 bullet points." The result is excellent.

**Climax:** She's impressed but cautious. She uses 3 more free AI calls that month. Each time, the AI does something useful — translates a paragraph, suggests a better headline, extracts key quotes. When she hits the limit, a gentle message says "You've used your free AI for this month. Upgrade for unlimited access."

**Resolution:** Dana thinks about it for a week. Next time she needs a translation, she pays. The price feels fair. She never felt pressured and nothing she relied on was taken away.

**Requirements revealed:** Backwards compatibility, settings migration, gentle upgrade prompts, trust-first paywall UX, affordable pricing

### Journey 4: Mike-to-Marko — The Transcription Pipeline User

**Who:** Avi, 52, consultant. He records client meetings using Mike (the transcription tool). Mike produces structured Hebrew transcripts in Markdown.

**Opening Scene:** Avi finishes a client call. Mike transcribes it and at the end says: "Want to format and act on this transcript? Open in Marko."

**Rising Action:** One click — the transcript opens in Marko, already rendered beautifully. Avi sees his meeting notes with clear headers, bullet points, and Hebrew text flowing correctly.

**Climax:** He clicks the AI button: "Extract action items from this meeting." Claude reads the full transcript and produces a clean task list with owners and deadlines. Avi then clicks "Draft follow-up email" — the AI generates a professional Hebrew email summarizing the meeting.

**Resolution:** Avi exports the action items as PDF, emails the follow-up, and archives the formatted transcript. Mike + Marko becomes his post-meeting workflow.

**Requirements revealed:** Deep link / URL-based content passing from Mike, AI multi-action pipeline, email drafting, PDF export, ecosystem integration

### Journey 5: BenAkiva — The Admin/Operator

**Who:** The product owner and sole operator of Marko.

**Opening Scene:** Monday morning. Open the Marko admin dashboard to check the weekend numbers.

**Rising Action:** 340 active users last week, 12 new registrations, 3 new paid conversions. AI usage: 89 free-tier calls, 247 paid calls. Cost per AI call averages 0.02 NIS. Revenue covers API costs with margin. One user hit the free AI limit 4 times in one month — strong conversion candidate.

**Climax:** Google Search Console shows "עורך מארקדאון" now has Marko on page 1 position 6, up from not ranking. A support email came in: "How do I export to Word?" — reply with a quick guide.

**Resolution:** Review analytics trends, note that AI translation is the most-used action, plan to improve it next sprint. Revenue growing slowly but sustainably. No complaints about pricing.

**Requirements revealed:** Admin dashboard, analytics (users, AI usage, costs, conversions), Google Search Console integration, support workflow, cost monitoring

### Journey Requirements Summary

| Capability | Journeys |
|---|---|
| Paste-first instant render | 1, 2, 3, 4 |
| Bilingual auto-detection (RTL/LTR per sentence) | 1, 2, 4 |
| Presentation / reading mode | 1 |
| PDF export with RTL + colors | 1, 2, 4 |
| HTML export with preserved styling | 2 |
| AI: translate section | 1, 3 |
| AI: extract action items | 2, 4 |
| AI: summarize | 3 |
| AI: draft email (Phase 3) | 4 |
| SEO / Google discoverability | 2 |
| Color themes + image extraction | 2 |
| Mermaid diagram support | 2 |
| Backwards compatibility + settings migration | 3 |
| Gentle upgrade prompts / trust-first paywall | 3 |
| Registration + payment flow | 1, 2, 3 |
| Mike to Marko deep link integration | 4 |
| Admin dashboard + analytics | 5 |
| Cost monitoring (AI API spend) | 5 |

## Domain-Specific Requirements

### AI Model Routing & Cost Optimization

**Intelligent model selection** — Marko's AI agent selects the appropriate Claude model per task, invisible to the user:

- **Haiku** — Language detection, short formatting fixes, simple classifications
- **Sonnet** — Default for all user-facing AI actions (summarize, translate, extract action items, rewrite). Available to all tiers.
- **Opus** — Complex multi-step tasks (deep analysis, flowchart generation from unstructured text, creative drafting). Paid users only.

**Tier-based model access:**

| Tier | AI Calls | Models Available |
|---|---|---|
| Anonymous | None | -- |
| Free registered | Limited per month (TBD) | Sonnet |
| Paid | Unlimited Sonnet + daily Opus allocation (TBD) | Sonnet + Opus |

Paid users can force Opus via an explicit toggle (e.g., "Deep Analysis" mode) when they want maximum quality, subject to their daily Opus allocation.

**Anti-abuse design:**
- AI features require registration (no anonymous AI access) — prevents throwaway account farming
- Rate limiting per account, not just per session
- Consider phone/email verification to prevent mass account creation
- Usage monitoring: flag accounts that exhibit farming patterns (create, use free AI, abandon, repeat)
- The tool is scoped to document actions only — not a general chatbot. This naturally limits abuse since each call requires a document context.

### Israeli Payment & Tax Compliance

- **Invoice/receipt generation:** Every paid transaction must produce a valid Israeli tax invoice or receipt. Existing relationship with **Sumit** for receipt generation — integrate with their API or workflow.
- **Payment provider:** Must support Israeli businesses — options include Stripe (supports Israel), Lemon Squeezy, or local providers like Meshulam, CardCom, or PayPlus
- **Accountant reporting:** Monthly transaction export compatible with Israeli accounting software or accountant workflows
- **VAT handling:** 17% VAT must be collected and displayed correctly on all invoices
- **Currency:** Primary pricing in NIS (ILS), with potential USD option for international users

### Privacy & Data Handling

- **Document content sent to AI:** Users must understand that pasted content is sent to Anthropic's API for AI processing. Clear disclosure required.
- **No document storage by default:** Documents live in the browser (localStorage) and are not stored server-side unless the user explicitly opts in (future feature)
- **AI API data:** Anthropic's API does not train on API inputs — this should be communicated to users for trust
- **Minimal data collection:** Authentication data, usage analytics, and payment info only. No document content stored on Marko's servers.
- **GDPR-adjacent:** While Israeli privacy law (PPPA) applies, following GDPR principles is good practice — data minimization, right to deletion, transparency

### Cost Structure Constraints

- **AI cost per call must be trackable:** Every API call logged with model used, token count, and cost
- **Cost ceiling per user:** If a paid user makes excessive calls, soft limits prevent runaway costs (e.g., fair use policy)
- **Pricing must cover costs + margin:** Subscription price must be set so that average AI usage per paid user generates positive margin after API costs
- **Cost monitoring dashboard:** Real-time visibility into total API spend, cost per user, cost per action type

## Innovation & Novel Patterns

### Detected Innovation Areas

1. **Hebrew-native bilingual auto-detection per sentence** — No existing Markdown editor analyzes character composition per sentence to auto-switch RTL/LTR alignment. Current tools apply direction globally (whole document) or require manual toggling. Marko's sentence-level detection would be a first in the Markdown tool space.

2. **AI as contextual document agent with intelligent model routing** — Rather than always hitting the most expensive model, Marko routes tasks to Haiku/Sonnet/Opus based on complexity. The user sees one "AI" button; the system optimizes cost behind the scenes. This is a novel pattern for consumer-facing AI tools — most either use one model for everything or expose confusing model selection to users.

3. **Markdown as universal viewing/presenting layer** — Repositioning a Markdown editor as a *viewer and presenter* for output from other tools (AI chatbots, developer tools, transcription services). Most Markdown tools assume users write Markdown; Marko recognizes that in 2026, most Markdown is machine-generated and users need to read, present, and act on it.

4. **Mike to Marko ecosystem pipeline** — A voice-to-structured-document-to-action workflow: record a meeting (Mike), transcribe to Markdown, open in Marko, render beautifully, use AI to extract action items and draft follow-up emails. This cross-product pipeline is a novel combination in the Hebrew tooling space.

### Validation Approach

- **Bilingual auto-detection:** Build a prototype using Unicode character range analysis. Test with mixed Hebrew/English documents from real users. Measure accuracy against manually-set direction per paragraph.
- **AI model routing:** A/B test identical tasks across Haiku/Sonnet/Opus to establish quality thresholds per task type. Define which tasks can use cheaper models without perceptible quality loss.
- **Markdown-as-viewer positioning:** Track what percentage of users paste content vs. type from scratch. If paste-first usage dominates, the viewer hypothesis is validated.
- **Mike to Marko pipeline:** Test with beta users who already use Mike. Measure completion rate of the full transcription to action items workflow.

### Risk Mitigation

- **Bilingual detection failures:** Mixed-language sentences (code comments in English within Hebrew prose) may confuse the detector. Fallback: default to document-level direction, allow manual override per block.
- **Model routing quality gaps:** If Sonnet output is noticeably worse than Opus for a task the router classified as "medium," users lose trust. Mitigation: conservative routing — when in doubt, use the higher model. Monitor user satisfaction signals (re-requests, complaints).
- **Viewer positioning may confuse writers:** If marketing focuses on "viewing" Markdown, power users who write may feel the tool isn't for them. Mitigation: position as "write, view, and act on" — cover all use cases in messaging.

## Web App Technical Requirements

Marko is a **Single-Page Application (SPA)** with server-side rendered landing/marketing pages for SEO. The editor is a single route. Framework choice (Next.js, Remix, or alternatives) is an architecture decision — the PRD is framework-neutral.

### Architecture

- Single editor page as the core experience — no page transitions or routing complexity for the user
- SSR/SSG for the landing page and marketing content (SEO-critical pages)
- Client-side rendering for the editor (performance-critical, no SEO needed)
- Modern browsers only: Chrome, Firefox, Edge, Safari (latest 2 versions). Mobile: Chrome Mobile, Safari iOS.
- No real-time collaboration — single-user tool. Real-time is a Vision-tier feature only.

### SEO Strategy

- Landing page fully server-rendered and crawlable
- Target Hebrew keywords: "עורך מארקדאון", "מארקדאון בעברית", "כלי מארקדאון"
- Structured data (JSON-LD): SoftwareApplication schema
- Sitemap.xml, robots.txt, Open Graph meta tags for social sharing

### Responsive Design

- **Desktop:** Two-panel layout (editor + preview side by side)
- **Tablet:** Stacked panels with toggle
- **Mobile:** Single panel with view mode toggle. Touch-friendly toolbar with overflow menu.
- **Breakpoints:** 1024px, 768px, 640px, 480px, desktop

### Migration Considerations

- Port existing vanilla JS logic into framework components. The rendering pipeline (Marked.js, Mermaid, Highlight.js) stays the same.
- Maintain installable PWA with service worker for offline editor use (AI features require network)
- Detect v1 localStorage keys and migrate to v2 format seamlessly
- Evaluate whether to bundle dependencies via npm or keep CDN loading

## Project Scoping & Phased Development

### MVP Strategy

**Approach:** Validation-first — launch Marko v2 with the full editor experience and free AI for all registered users. No payment system in Phase 1. Goal: prove that users want AI features badly enough to pay, then add payments once demand is validated.

**Resource:** Solo developer with AI-assisted development. Framework migration, AI agent integration, and auth are the three main workstreams.

### Phase 1: MVP (Marko v2 Launch)

**Core User Journeys Supported:** Noa (paste-and-present), Yuval (developer writing), Dana (v1 migration)

**Must-Have Capabilities:**

| Capability | Rationale |
|---|---|
| Platform migration (SPA + SSR landing) | Foundation for everything else |
| All v1 features preserved identically | Trust-first: don't break what users love |
| PDF export overhaul (html2pdf.js) | Highest pain point from improvements doc |
| Bilingual auto-detection (per sentence) | Key differentiator, must ship with v2 |
| Authentication (anonymous + registered) | Required for AI usage tracking and limits |
| AI integration (Sonnet for all registered users) | Core value proposition — free for all initially to validate demand |
| AI model routing (Haiku/Sonnet) | Cost optimization from day one |
| SEO landing page | Google discoverability is a success criterion |
| Basic analytics | Track usage, AI calls, feature adoption |
| localStorage migration from v1 | Seamless transition for existing users |
| Accessibility (WCAG AA) | Core requirement, not optional |
| Presentation / reading mode | Key use case for paste-and-present users |

**Explicitly NOT in Phase 1:**
- Payment system (validate demand first)
- Opus model access (no paid tier yet)
- Mike integration (future ecosystem)
- Advanced PDF controls (margins, cover page, TOC)
- Document templates
- Theme export/import/sharing
- Admin dashboard (use direct database/analytics tools initially)

### Phase 2: Monetization (Post-Validation)

**Trigger:** Analytics show users hitting free AI limits and expressing willingness to pay.

- Payment system: Stripe or local Israeli provider + Sumit integration for receipts
- 3-tier model: Anonymous (basic) / Free registered (limited AI) / Paid (unlimited Sonnet + daily Opus)
- Opus access for paid users with force-Opus toggle
- Gentle upgrade prompts (trust-first paywall UX)
- Cost monitoring and admin dashboards
- Anti-abuse measures (rate limiting, account farming detection)

### Phase 3: Growth

- Advanced PDF controls (margins, paper size, cover page, TOC, headers/footers)
- Additional AI actions (generate flowcharts, draft emails, create new docs from bullets)
- Document templates (meeting notes, project brief, resume)
- Named document snapshots and version history
- Image-based theme generation with WCAG contrast validation
- Theme export/import/sharing
- Mobile-optimized layout with touch-friendly toolbar
- Mike to Marko deep link integration

### Phase 4: Vision

- Full Mike + Marko ecosystem pipeline
- Team/collaboration features
- Theme marketplace or community gallery
- Advanced AI: document-aware chat, multi-document analysis
- API for third-party integrations
- i18n: Arabic and other RTL language support

### Risk Mitigation Strategy

**Technical:** Platform migration is well-understood — the rendering pipeline is proven. Bilingual auto-detection is novel — prototype early with real documents.

**Market:** Phase 1 validates willingness to pay by giving AI free and measuring reliance before introducing limits. Phase 2 starts with low pricing and adjusts.

**Resource:** Solo developer with AI-assisted development. Current v1 tool continues serving users unchanged if Phase 1 takes longer than expected.

## Functional Requirements

### Document Editing & Rendering

- FR1: Users can paste or type Markdown content into an editor
- FR2: Users can see real-time rendered preview of their Markdown content
- FR3: Users can toggle between editor-only, preview-only, and split view modes
- FR4: Users can enter a presentation/reading mode that displays rendered content in a large, distraction-free format
- FR5: Users can insert Markdown formatting via a toolbar (bold, italic, headings, lists, code blocks, links, images, tables)
- FR6: Users can insert Mermaid diagram templates and see them rendered inline
- FR7: System auto-detects Hebrew vs English per sentence and applies correct text direction (RTL/LTR) automatically
- FR8: Users can manually override text direction at the document level
- FR9: Users can clear the editor content
- FR10: Users can load a sample document to explore the tool

### Export & Output

- FR11: Users can export the rendered document as a PDF with preserved colors, RTL direction, and Mermaid diagrams
- FR12: Users can export the rendered document as a styled HTML file
- FR13: Users can export the raw Markdown as a .md file
- FR14: Users can copy formatted content to clipboard for pasting into Microsoft Word with RTL preservation
- FR15: Users can copy rendered HTML or plain text to clipboard
- FR16: Users can specify a custom filename before exporting (auto-suggested from first heading)
- FR17: System shows a progress indicator during PDF generation

### Color Theming & Customization

- FR18: Users can customize 17 color properties of the preview rendering
- FR19: Users can select from built-in color theme presets
- FR20: Users can save and load custom color presets
- FR21: Users can extract a color palette from an uploaded image and apply it as a theme
- FR22: Users can toggle between dark and light UI modes
- FR23: System persists color customizations across sessions

### AI Document Actions

- FR24: Registered users can invoke AI actions on their document content
- FR25: Users can ask the AI to summarize their document or a selected section
- FR26: Users can ask the AI to translate a section between Hebrew and English
- FR27: Users can ask the AI to extract action items from their document
- FR28: Users can ask the AI to suggest grammar, style, and clarity improvements to their content
- FR29: System routes AI tasks to the appropriate model (Haiku/Sonnet) based on task complexity, invisible to the user
- FR30: System enforces AI usage limits based on user tier (free: limited per month, paid: unlimited Sonnet + daily Opus)
- FR31: When users who have reached their free AI usage limit open the AI command palette, AI actions appear dimmed with an inline upgrade prompt and link — communicated contextually at the point of action, not via a banner or modal

### User Accounts & Authentication

- FR32: Users can use the core editor without logging in (anonymous tier)
- FR33: Users can register for a free account to unlock AI features
- FR34: Users can log in and log out of their account
- FR35: System distinguishes between anonymous, free registered, and paid user tiers
- FR36: System migrates v1 user settings (colors, content) when a v1 user visits Marko v2

### Payments & Subscription (Phase 2)

- FR37: Registered users can upgrade to a paid subscription
- FR38: Paid users can access Opus-level AI with a daily allocation
- FR39: Paid users can force the Opus model via an explicit toggle
- FR40: System generates valid Israeli tax invoices/receipts for each transaction via Sumit
- FR41: Users can manage their subscription (view status, cancel)

### Analytics & Operator Tools

- FR42: System tracks user registrations, logins, and feature usage events
- FR43: System logs every AI API call with model used, token count, and cost
- FR44: Operator can view usage analytics (active users, AI calls, feature adoption)
- FR45: Operator can monitor AI API costs in real-time
- FR46: System flags accounts exhibiting potential abuse patterns

### SEO & Discovery

- FR47: System serves a crawlable, SEO-optimized landing page
- FR48: Landing page includes structured data, Open Graph meta tags, sitemap, and robots.txt
- FR49: Landing page targets Hebrew keywords for Markdown editor searches

### Privacy & Compliance

- FR50: System displays a visible notice before AI processing, informing users their document content will be sent to the AI provider
- FR51: System does not store document content on the server
- FR52: Users can delete their account and all associated data

## Non-Functional Requirements

### Performance

- Editor page loads in under 2 seconds on a 4G connection
- Markdown paste-to-rendered-preview completes in under 100ms
- AI Sonnet responses return in under 10 seconds; Opus in under 20 seconds
- PDF export generates in under 5 seconds for documents up to 20 pages
- Rendering debounce remains at 150ms or less during typing
- Landing page achieves Lighthouse score of 90+ (Performance, Accessibility, Best Practices, SEO)

### Security

- All data in transit encrypted via HTTPS (TLS 1.2+)
- Authentication tokens stored securely using server-side or platform-recommended mechanisms
- AI API keys never exposed to the client — all AI calls proxied through the backend
- Payment data handled entirely by the payment provider (PCI-DSS compliance via Stripe/provider, no card data on Marko servers)
- Rate limiting on AI endpoints to prevent abuse (per-account and per-IP)
- CSRF protection on all authenticated endpoints
- Input sanitization on all user-submitted data sent to the backend

### Scalability

- System supports up to 1,000 concurrent users in Phase 1 without performance degradation
- AI proxy layer handles up to 5x average load with request queuing
- Architecture supports horizontal scaling when concurrent users exceed 1,000
- Analytics pipeline handles up to 10,000 events per minute without blocking user-facing operations

### Accessibility

- WCAG AA compliance across all interactive elements
- All toolbar buttons, modals, and controls have Hebrew ARIA labels
- Full keyboard navigation without mouse dependency
- Focus trapping in modals with proper focus return
- Color contrast ratio of 4.5:1 minimum for all text/background combinations
- Screen reader-compatible preview output (semantic HTML: headings, lists, tables)
- Visible focus indicators on all interactive elements
- RTL-aware accessibility: assistive technologies correctly interpret right-to-left content flow

### Integration

- Anthropic Claude API: Haiku, Sonnet, and Opus model access via server-side proxy
- Payment provider API (Phase 2): Stripe or Israeli provider for subscription management
- Sumit API (Phase 2): automated receipt/invoice generation per transaction
- Analytics service: event tracking for user behavior, AI usage, and conversion metrics
- Future: Mike integration via URL-based content passing (deep link protocol)

### Reliability

- Editor functions fully offline (except AI features)
- System auto-saves editor content — no work lost on accidental page close or refresh
- AI service degradation is graceful: if the API is down, users see an informational banner explaining AI is temporarily unavailable and can continue using all non-AI features
- Export functions work independently of network connectivity (client-side PDF/HTML/MD generation)
