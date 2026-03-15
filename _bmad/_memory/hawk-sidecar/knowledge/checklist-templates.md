# Visual Checklist Templates by Story Type

All checks are visual-only (V-xx prefix). No functional/logic testing.

## Template: New UI Component

- [ ] Component renders correctly at desktop (1440px) — proper sizing, spacing, alignment
- [ ] Component renders correctly at tablet (768px) — no clipping, responsive adaptation
- [ ] Component renders correctly at mobile (375px) — stacks/scrolls appropriately
- [ ] RTL layout correct (if applicable) — text aligned, layout mirrored
- [ ] Typography matches design system — correct fonts, sizes, weights
- [ ] Colors match semantic meaning — states, accents, backgrounds consistent with design system
- [ ] Icons are actual icons (not colored circles/placeholders)
- [ ] No text clipping, overflow, or ellipsis where content should be fully visible
- [ ] Empty/loading states display with proper visual treatment

## Template: Form / Data Entry

- [ ] Form layout and field alignment at all breakpoints
- [ ] Labels aligned correctly with inputs (RTL-aware if applicable)
- [ ] Input fields properly sized — not too narrow, not overflowing
- [ ] Validation error messages visible and properly positioned
- [ ] All text in correct language (no untranslated placeholders)

## Template: Dashboard / Data Display

- [ ] Data visualization renders at all breakpoints without clipping
- [ ] Table/grid columns aligned, headers match data
- [ ] RTL layout of charts/tables/cards (if applicable)
- [ ] Numbers, dates formatted correctly for locale
- [ ] Loading skeleton/spinner appears with proper visual treatment
- [ ] Color-coded data elements use correct semantic colors
- [ ] Cards/items have consistent spacing and visual weight

## Template: Navigation / Routing Change

- [ ] New routes/links appear in correct position within navigation
- [ ] Active state indicators visible and correctly styled
- [ ] Navigation elements mirror correctly in RTL (if applicable)
- [ ] Dropdown menus open near their trigger (not at screen edge)

## Template: Bug Fix / Minor Change

- [ ] The visual issue described in the bug is resolved
- [ ] No visual regression in surrounding UI elements
- [ ] Fix is consistent across breakpoints (mobile/tablet/desktop)

## Checklist Sizing Guide

| Story Complexity          | Total Visual Items | Breakpoints to Check | RTL Items |
| ------------------------- | ------------------ | -------------------- | --------- |
| Simple (bug fix, tweak)   | 2-4                | 1-2                  | 0-1       |
| Medium (new component)    | 5-8                | 3                    | 1-3       |
| Complex (new module/page) | 8-12               | 3-4                  | 2-4       |
