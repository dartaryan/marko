import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { ThemeCard } from './ThemeCard';
import { CURATED_THEMES } from '@/lib/colors/themes';

const freeTheme = CURATED_THEMES.find((t) => t.tier === 'free')!;
const premiumTheme = CURATED_THEMES.find((t) => t.tier === 'premium')!;

/** Convert hex color (#RRGGBB) to rgb() string as JSDOM normalizes inline styles */
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  document.body.removeChild(container);
});

function renderCard(props: Partial<React.ComponentProps<typeof ThemeCard>> = {}) {
  const defaults = {
    theme: freeTheme,
    isActive: false,
    isPremiumLocked: false,
    tabIndex: 0,
    onClick: vi.fn(),
    onKeyDown: vi.fn(),
  };
  const merged = { ...defaults, ...props };
  act(() => {
    root = createRoot(container);
    root.render(<ThemeCard {...merged} />);
  });
  return merged;
}

// ─── 5.1: ThemeCard renders mini document mockup ────────────────────────────

describe('ThemeCard — rendering', () => {
  it('renders heading text "כותרת ראשית" in h1 color', () => {
    renderCard();
    const heading = container.querySelector('div[aria-hidden="true"]') as HTMLElement;
    expect(heading).not.toBeNull();
    expect(heading.textContent).toBe('כותרת ראשית');
    expect(heading.style.color).toBe(hexToRgb(freeTheme.colors.h1));
  });

  it('renders body text in primaryText color', () => {
    renderCard();
    const divs = Array.from(container.querySelectorAll('div[aria-hidden="true"]'));
    const bodyDiv = divs.find((d) => d.textContent?.includes('טקסט לדוגמה'));
    expect(bodyDiv).toBeDefined();
    expect((bodyDiv as HTMLElement).style.color).toBe(hexToRgb(freeTheme.colors.primaryText));
  });

  it('renders code block with codeBg background and code color', () => {
    renderCard();
    const divs = Array.from(container.querySelectorAll('div[aria-hidden="true"]'));
    const codeDiv = divs.find((d) => d.textContent?.includes('const x = 42;'));
    expect(codeDiv).toBeDefined();
    expect((codeDiv as HTMLElement).style.backgroundColor).toBe(hexToRgb(freeTheme.colors.codeBg));
    expect((codeDiv as HTMLElement).style.color).toBe(hexToRgb(freeTheme.colors.code));
  });

  it('renders card background using theme previewBg color', () => {
    renderCard();
    const mockup = container.querySelector('button > div') as HTMLElement;
    expect(mockup.style.backgroundColor).toBe(hexToRgb(freeTheme.colors.previewBg));
  });

  it('renders theme hebrewName label', () => {
    renderCard();
    expect(container.textContent).toContain(freeTheme.hebrewName);
  });

  it('renders with role="radio"', () => {
    renderCard();
    const button = container.querySelector('button[role="radio"]');
    expect(button).not.toBeNull();
  });

  it('sets aria-checked based on isActive prop', () => {
    renderCard({ isActive: true });
    const button = container.querySelector('button[role="radio"]') as HTMLButtonElement;
    expect(button.getAttribute('aria-checked')).toBe('true');
  });

  it('sets aria-checked=false when not active', () => {
    renderCard({ isActive: false });
    const button = container.querySelector('button[role="radio"]') as HTMLButtonElement;
    expect(button.getAttribute('aria-checked')).toBe('false');
  });
});

// ─── Premium badge ──────────────────────────────────────────────────────────

describe('ThemeCard — premium badge', () => {
  it('shows "פרימיום" text for premium locked themes', () => {
    renderCard({ theme: premiumTheme, isPremiumLocked: true });
    expect(container.textContent).toContain('פרימיום');
  });

  it('does NOT show premium badge for free themes', () => {
    renderCard({ theme: freeTheme, isPremiumLocked: false });
    expect(container.textContent).not.toContain('פרימיום');
  });

  it('includes "(פרימיום)" in aria-label for premium locked themes', () => {
    renderCard({ theme: premiumTheme, isPremiumLocked: true });
    const button = container.querySelector('button[role="radio"]') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toContain('(פרימיום)');
  });
});

// ─── Active state ───────────────────────────────────────────────────────────

describe('ThemeCard — active state', () => {
  it('has primary border when active', () => {
    renderCard({ isActive: true });
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.className).toContain('border-[var(--primary)]');
  });

  it('has default border when not active', () => {
    renderCard({ isActive: false });
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.className).toContain('border-[var(--border)]');
  });
});

// ─── Click and keyboard handlers ────────────────────────────────────────────

describe('ThemeCard — interactions', () => {
  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    renderCard({ onClick });
    const button = container.querySelector('button') as HTMLButtonElement;
    act(() => { button.click(); });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onKeyDown when key is pressed', () => {
    const onKeyDown = vi.fn();
    renderCard({ onKeyDown });
    const button = container.querySelector('button') as HTMLButtonElement;
    act(() => {
      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
});
