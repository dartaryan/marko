import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { SaveStatusIndicator } from './SaveStatusIndicator';

describe('SaveStatusIndicator', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('renders with opacity-0 for idle status', () => {
    act(() => root.render(React.createElement(SaveStatusIndicator, { status: 'idle' })));
    const statusEl = container.querySelector('[role="status"]');
    expect(statusEl).toBeTruthy();
    const span = statusEl?.querySelector('span');
    expect(span).toBeTruthy();
    expect(span?.className).toContain('opacity-0');
    expect(span?.textContent).toBe('');
  });

  it('renders "שומר..." for saving status', () => {
    act(() => root.render(React.createElement(SaveStatusIndicator, { status: 'saving' })));
    const statusEl = container.querySelector('[role="status"]');
    const span = statusEl?.querySelector('span');
    expect(span?.textContent).toBe('שומר...');
    expect(span?.className).toContain('opacity-100');
    expect(span?.className).toContain('motion-safe:animate-pulse');
  });

  it('renders "נשמר" for saved status', () => {
    act(() => root.render(React.createElement(SaveStatusIndicator, { status: 'saved' })));
    const statusEl = container.querySelector('[role="status"]');
    const span = statusEl?.querySelector('span');
    expect(span?.textContent).toContain('נשמר');
    expect(span?.className).toContain('opacity-100');
  });

  it('renders "שגיאה בשמירה" for error status', () => {
    act(() => root.render(React.createElement(SaveStatusIndicator, { status: 'error' })));
    const statusEl = container.querySelector('[role="status"]');
    const span = statusEl?.querySelector('span');
    expect(span?.textContent).toBe('שגיאה בשמירה');
    expect(span?.className).toContain('text-destructive');
    expect(span?.className).toContain('opacity-100');
  });

  it('has correct accessibility attributes', () => {
    act(() => root.render(React.createElement(SaveStatusIndicator, { status: 'saving' })));
    const statusEl = container.querySelector('[role="status"]');
    expect(statusEl?.getAttribute('aria-live')).toBe('polite');
  });
});
