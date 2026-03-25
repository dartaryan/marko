import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { AccentCustomizer } from './AccentCustomizer';

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => { root?.unmount(); });
  document.body.removeChild(container);
});

function renderCustomizer(props: Partial<React.ComponentProps<typeof AccentCustomizer>> = {}) {
  const defaults = {
    onThemeChange: vi.fn(),
    onClearActiveSelections: vi.fn(),
  };
  const merged = { ...defaults, ...props };
  act(() => {
    root = createRoot(container);
    root.render(<AccentCustomizer {...merged} />);
  });
  return merged;
}

describe('AccentCustomizer', () => {
  it('renders collapsed by default with "התאמה אישית" label', () => {
    renderCustomizer();
    const toggle = container.querySelector('button[aria-label="התאמה אישית"]') as HTMLButtonElement;
    expect(toggle).not.toBeNull();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.textContent).toContain('התאמה אישית');
  });

  it('does not render HslWheel or ContrastIndicator when collapsed', () => {
    renderCustomizer();
    expect(container.querySelector('canvas')).toBeNull();
    expect(container.textContent).not.toContain('ניגודיות:');
  });

  it('expands when toggle is clicked', () => {
    renderCustomizer();
    const toggle = container.querySelector('button[aria-label="התאמה אישית"]') as HTMLButtonElement;
    act(() => { toggle.click(); });

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    // HslWheel canvas should now be visible
    expect(container.querySelector('canvas')).not.toBeNull();
    // ContrastIndicator should show
    expect(container.textContent).toContain('ניגודיות:');
  });

  it('collapses again when toggle is clicked twice', () => {
    renderCustomizer();
    const toggle = container.querySelector('button[aria-label="התאמה אישית"]') as HTMLButtonElement;
    act(() => { toggle.click(); });
    act(() => { toggle.click(); });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('uses controlled expanded state when prop is provided', () => {
    const onExpandedChange = vi.fn();
    renderCustomizer({ expanded: true, onExpandedChange });
    const toggle = container.querySelector('button[aria-label="התאמה אישית"]') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('canvas')).not.toBeNull();

    act(() => { toggle.click(); });
    expect(onExpandedChange).toHaveBeenCalledWith(false);
  });

  it('has Paintbrush icon in toggle button', () => {
    renderCustomizer();
    const toggle = container.querySelector('button[aria-label="התאמה אישית"]') as HTMLButtonElement;
    const svgs = toggle.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2); // ChevronDown + Paintbrush
  });

  it('calls onThemeChange with 17-property theme when accent is changed via lightness slider', () => {
    const onThemeChange = vi.fn();
    const onClearActiveSelections = vi.fn();
    renderCustomizer({ onThemeChange, onClearActiveSelections });

    // Expand first
    const toggle = container.querySelector('button[aria-label="התאמה אישית"]') as HTMLButtonElement;
    act(() => { toggle.click(); });

    // Change lightness slider
    const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
    act(() => {
      Object.defineProperty(slider, 'value', { writable: true, value: '60' });
      slider.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(onThemeChange).toHaveBeenCalled();
    const theme = onThemeChange.mock.calls[0][0];
    expect(Object.keys(theme)).toHaveLength(17);
    expect(onClearActiveSelections).toHaveBeenCalled();
  });
});
