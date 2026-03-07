import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { ThemeToggle } from './ThemeToggle';

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  // jsdom does not implement matchMedia — stub it returning light-mode (false)
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  document.body.removeChild(container);
});

describe('ThemeToggle', () => {
  it('renders with aria-label "עבור למצב כהה" in light mode (default)', () => {
    act(() => {
      root = createRoot(container);
      root.render(<ThemeToggle />);
    });
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('aria-label')).toBe('עבור למצב כהה');
  });

  it('clicking adds .dark class to documentElement', () => {
    act(() => {
      root = createRoot(container);
      root.render(<ThemeToggle />);
    });
    act(() => {
      container.querySelector('button')!.click();
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('clicking persists isDark=true to localStorage', () => {
    act(() => {
      root = createRoot(container);
      root.render(<ThemeToggle />);
    });
    act(() => {
      container.querySelector('button')!.click();
    });
    expect(JSON.parse(localStorage.getItem('marko-v2-ui-mode')!)).toBe(true);
  });

  it('clicking twice removes .dark class and persists false to localStorage', () => {
    act(() => {
      root = createRoot(container);
      root.render(<ThemeToggle />);
    });
    act(() => {
      container.querySelector('button')!.click();
    });
    act(() => {
      container.querySelector('button')!.click();
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(JSON.parse(localStorage.getItem('marko-v2-ui-mode')!)).toBe(false);
  });

  it('SSR renders with light-mode aria-label (no localStorage on server)', () => {
    const html = renderToStaticMarkup(<ThemeToggle />);
    expect(html).toContain('aria-label="עבור למצב כהה"');
  });

  it('applies dark mode on first visit when system prefers dark (AC4)', () => {
    // Override matchMedia to simulate a dark-system-preference user with no saved preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
    act(() => {
      root = createRoot(container);
      root.render(<ThemeToggle />);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
