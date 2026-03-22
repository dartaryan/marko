import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { DirectionIndicator } from './DirectionIndicator';

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  vi.clearAllMocks();
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
});

describe('DirectionIndicator', () => {
  it('displays "BiDi" when value is auto', () => {
    act(() => {
      root = createRoot(container);
      root.render(<DirectionIndicator value="auto" onChange={vi.fn()} />);
    });
    const indicator = container.querySelector('.marko-direction-indicator')!;
    expect(indicator.textContent).toBe('BiDi');
  });

  it('displays "RTL" when value is rtl', () => {
    act(() => {
      root = createRoot(container);
      root.render(<DirectionIndicator value="rtl" onChange={vi.fn()} />);
    });
    const indicator = container.querySelector('.marko-direction-indicator')!;
    expect(indicator.textContent).toBe('RTL');
  });

  it('displays "LTR" when value is ltr', () => {
    act(() => {
      root = createRoot(container);
      root.render(<DirectionIndicator value="ltr" onChange={vi.fn()} />);
    });
    const indicator = container.querySelector('.marko-direction-indicator')!;
    expect(indicator.textContent).toBe('LTR');
  });

  it('cycles auto → rtl on click', () => {
    const onChange = vi.fn();
    act(() => {
      root = createRoot(container);
      root.render(<DirectionIndicator value="auto" onChange={onChange} />);
    });
    const indicator = container.querySelector('.marko-direction-indicator') as HTMLElement;
    act(() => {
      indicator.click();
    });
    expect(onChange).toHaveBeenCalledWith('rtl');
  });

  it('cycles rtl → ltr on click', () => {
    const onChange = vi.fn();
    act(() => {
      root = createRoot(container);
      root.render(<DirectionIndicator value="rtl" onChange={onChange} />);
    });
    const indicator = container.querySelector('.marko-direction-indicator') as HTMLElement;
    act(() => {
      indicator.click();
    });
    expect(onChange).toHaveBeenCalledWith('ltr');
  });

  it('cycles ltr → auto on click', () => {
    const onChange = vi.fn();
    act(() => {
      root = createRoot(container);
      root.render(<DirectionIndicator value="ltr" onChange={onChange} />);
    });
    const indicator = container.querySelector('.marko-direction-indicator') as HTMLElement;
    act(() => {
      indicator.click();
    });
    expect(onChange).toHaveBeenCalledWith('auto');
  });

  it('has correct Hebrew tooltip for auto', () => {
    act(() => {
      root = createRoot(container);
      root.render(<DirectionIndicator value="auto" onChange={vi.fn()} />);
    });
    const indicator = container.querySelector('.marko-direction-indicator')!;
    expect(indicator.getAttribute('title')).toBe('כיוון טקסט: אוטומטי');
  });

  it('has correct Hebrew tooltip for rtl', () => {
    act(() => {
      root = createRoot(container);
      root.render(<DirectionIndicator value="rtl" onChange={vi.fn()} />);
    });
    const indicator = container.querySelector('.marko-direction-indicator')!;
    expect(indicator.getAttribute('title')).toBe('כיוון טקסט: ימין לשמאל');
  });

  it('is keyboard accessible — activates on Enter', () => {
    const onChange = vi.fn();
    act(() => {
      root = createRoot(container);
      root.render(<DirectionIndicator value="auto" onChange={onChange} />);
    });
    const indicator = container.querySelector('.marko-direction-indicator') as HTMLElement;
    act(() => {
      indicator.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    expect(onChange).toHaveBeenCalledWith('rtl');
  });

  it('is keyboard accessible — activates on Space', () => {
    const onChange = vi.fn();
    act(() => {
      root = createRoot(container);
      root.render(<DirectionIndicator value="auto" onChange={onChange} />);
    });
    const indicator = container.querySelector('.marko-direction-indicator') as HTMLElement;
    act(() => {
      indicator.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    });
    expect(onChange).toHaveBeenCalledWith('rtl');
  });

  it('is focusable via tabIndex', () => {
    act(() => {
      root = createRoot(container);
      root.render(<DirectionIndicator value="auto" onChange={vi.fn()} />);
    });
    const indicator = container.querySelector('.marko-direction-indicator') as HTMLElement;
    expect(indicator.getAttribute('tabindex')).toBe('0');
  });

  it('has role="button"', () => {
    act(() => {
      root = createRoot(container);
      root.render(<DirectionIndicator value="auto" onChange={vi.fn()} />);
    });
    const indicator = container.querySelector('.marko-direction-indicator') as HTMLElement;
    expect(indicator.getAttribute('role')).toBe('button');
  });
});
