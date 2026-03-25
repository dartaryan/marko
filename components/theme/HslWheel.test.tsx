import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { HslWheel } from './HslWheel';

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

function renderWheel(props: Partial<React.ComponentProps<typeof HslWheel>> = {}) {
  const defaults = {
    value: { h: 160, s: 70, l: 50 },
    onChange: vi.fn(),
  };
  const merged = { ...defaults, ...props };
  act(() => {
    root = createRoot(container);
    root.render(<HslWheel {...merged} />);
  });
  return merged;
}

describe('HslWheel', () => {
  it('renders a canvas element with correct dimensions', () => {
    renderWheel();
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).not.toBeNull();
    expect(canvas.width).toBe(180);
    expect(canvas.height).toBe(180);
  });

  it('renders canvas with Hebrew aria-label', () => {
    renderWheel();
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.getAttribute('aria-label')).toBe('בורר גוון ורוויה');
  });

  it('renders a lightness slider with range 0-100', () => {
    renderWheel();
    const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
    expect(slider).not.toBeNull();
    expect(slider.min).toBe('0');
    expect(slider.max).toBe('100');
    expect(slider.getAttribute('aria-label')).toBe('בהירות');
  });

  it('renders a hex text input with dir="ltr"', () => {
    renderWheel();
    const textInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(textInput).not.toBeNull();
    expect(textInput.dir).toBe('ltr');
    expect(textInput.getAttribute('aria-label')).toBe('ערך צבע הקסדצימלי');
  });

  it('shows current hex value in text input', () => {
    renderWheel({ value: { h: 0, s: 100, l: 50 } });
    const textInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(textInput.value).toBe('#FF0000');
  });

  it('calls onChange when lightness slider changes', () => {
    const onChange = vi.fn();
    renderWheel({ value: { h: 160, s: 70, l: 50 }, onChange });

    const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
    act(() => {
      Object.defineProperty(slider, 'value', { writable: true, value: '75' });
      slider.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalledWith({ h: 160, s: 70, l: 75 });
  });

  it('calls onChange when valid hex is typed', () => {
    const onChange = vi.fn();
    renderWheel({ onChange });

    const textInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    act(() => {
      // Simulate typing a valid hex value
      const nativeInputSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )!.set!;
      nativeInputSetter.call(textInput, '#3B82F6');
      textInput.dispatchEvent(new Event('input', { bubbles: true }));
      textInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalled();
    const call = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(call).toHaveProperty('h');
    expect(call).toHaveProperty('s');
    expect(call).toHaveProperty('l');
  });

  it('renders a color preview swatch', () => {
    renderWheel({ value: { h: 0, s: 100, l: 50 } });
    const swatch = container.querySelector('div[aria-hidden="true"]') as HTMLDivElement;
    expect(swatch).not.toBeNull();
    expect(swatch.style.backgroundColor).toBeTruthy();
  });

  it('lightness label is in Hebrew', () => {
    renderWheel();
    const label = container.querySelector('label');
    expect(label?.textContent).toBe('בהירות');
  });
});
