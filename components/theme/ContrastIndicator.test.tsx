import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { ContrastIndicator } from './ContrastIndicator';

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

function renderIndicator(textHex: string, bgHex: string) {
  act(() => {
    root = createRoot(container);
    root.render(<ContrastIndicator textHex={textHex} bgHex={bgHex} />);
  });
}

describe('ContrastIndicator', () => {
  it('shows passing indicator for black on white', () => {
    renderIndicator('#000000', '#FFFFFF');
    const text = container.textContent ?? '';
    expect(text).toContain('ניגודיות:');
    expect(text).toContain('21.0:1');
    expect(text).toContain('\u2713'); // checkmark
  });

  it('shows failing indicator for light gray on white', () => {
    renderIndicator('#CCCCCC', '#FFFFFF');
    const text = container.textContent ?? '';
    expect(text).toContain('ניגודיות:');
    expect(text).toContain('\u26A0'); // warning
  });

  it('uses success color class for passing contrast', () => {
    renderIndicator('#000000', '#FFFFFF');
    const ratioSpan = container.querySelector('span.text-\\[var\\(--success\\)\\]');
    expect(ratioSpan).not.toBeNull();
  });

  it('uses warning color class for failing contrast', () => {
    renderIndicator('#CCCCCC', '#FFFFFF');
    const ratioSpan = container.querySelector('span.text-\\[var\\(--warning\\)\\]');
    expect(ratioSpan).not.toBeNull();
  });

  it('has descriptive Hebrew aria-label', () => {
    renderIndicator('#000000', '#FFFFFF');
    const wrapper = container.querySelector('div[aria-label]') as HTMLElement;
    expect(wrapper.getAttribute('aria-label')).toContain('ניגודיות');
    expect(wrapper.getAttribute('aria-label')).toContain('עובר');
  });

  it('shows failing text in aria-label for low contrast', () => {
    renderIndicator('#CCCCCC', '#FFFFFF');
    const wrapper = container.querySelector('div[aria-label]') as HTMLElement;
    expect(wrapper.getAttribute('aria-label')).toContain('נכשל');
  });
});
