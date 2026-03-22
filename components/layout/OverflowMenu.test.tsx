import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { OverflowMenu } from './OverflowMenu';

// Stub matchMedia for Radix internals
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

// Radix DropdownMenu uses Popper which needs ResizeObserver
class FakeResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;

// Radix needs DOMRect for positioning
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  x: 0, y: 0, width: 100, height: 40, top: 0, right: 100, bottom: 40, left: 0, toJSON: () => {},
}));

const defaultProps = {
  docDirection: 'auto' as const,
  onDirectionChange: vi.fn(),
  onLoadSample: vi.fn(),
  onClearEditor: vi.fn(),
  onEnterPresentation: vi.fn(),
};

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

/** Radix DropdownMenu opens via pointerdown, not click */
function openMenu(trigger: HTMLElement) {
  act(() => {
    trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, pointerType: 'mouse' }));
  });
  // Radix also needs click after pointerdown for full open cycle
  act(() => {
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

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
  // Clean up any portaled content
  document.querySelectorAll('[data-radix-popper-content-wrapper]').forEach((el) => el.remove());
  document.querySelectorAll('[role="menu"]').forEach((el) => el.parentElement?.remove());
});

describe('OverflowMenu', () => {
  it('renders the trigger button with correct aria-label', () => {
    act(() => {
      root = createRoot(container);
      root.render(<OverflowMenu {...defaultProps} />);
    });
    const trigger = container.querySelector('[aria-label="תפריט נוסף"]')!;
    expect(trigger).toBeTruthy();
    expect(trigger.tagName).toBe('BUTTON');
  });

  it('has correct CSS class on trigger button', () => {
    act(() => {
      root = createRoot(container);
      root.render(<OverflowMenu {...defaultProps} />);
    });
    const trigger = container.querySelector('[aria-label="תפריט נוסף"]') as HTMLElement;
    expect(trigger.classList.contains('marko-header-btn')).toBe(true);
  });

  it('trigger has aria-haspopup attribute', () => {
    act(() => {
      root = createRoot(container);
      root.render(<OverflowMenu {...defaultProps} />);
    });
    const trigger = container.querySelector('[aria-label="תפריט נוסף"]') as HTMLElement;
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('opens dropdown on trigger click and renders menu content', async () => {
    act(() => {
      root = createRoot(container);
      root.render(<OverflowMenu {...defaultProps} />);
    });

    const trigger = container.querySelector('[aria-label="תפריט נוסף"]') as HTMLButtonElement;
    openMenu(trigger);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    // Radix renders menu content in a portal on document.body
    const menuContent = document.querySelector('[role="menu"]');
    expect(menuContent).toBeTruthy();
  });

  it('shows menu items with correct Hebrew labels when open', async () => {
    act(() => {
      root = createRoot(container);
      root.render(<OverflowMenu {...defaultProps} />);
    });

    const trigger = container.querySelector('[aria-label="תפריט נוסף"]') as HTMLButtonElement;
    openMenu(trigger);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const menuContent = document.querySelector('[role="menu"]');
    expect(menuContent).toBeTruthy();
    const text = menuContent!.textContent || '';
    expect(text).toContain('מסמך לדוגמה');
    expect(text).toContain('נקה עורך');
    expect(text).toContain('מצגת');
    expect(text).toContain('כיוון טקסט');
  });

  it('renders with all required props', () => {
    // Verify component renders without errors with all prop combinations
    act(() => {
      root = createRoot(container);
      root.render(
        <OverflowMenu
          docDirection="rtl"
          onDirectionChange={vi.fn()}
          onLoadSample={vi.fn()}
          onClearEditor={vi.fn()}
          onEnterPresentation={vi.fn()}
        />
      );
    });
    expect(container.querySelector('[aria-label="תפריט נוסף"]')).toBeTruthy();
  });

  it('renders trigger with MoreHorizontal icon (svg)', () => {
    act(() => {
      root = createRoot(container);
      root.render(<OverflowMenu {...defaultProps} />);
    });
    const trigger = container.querySelector('[aria-label="תפריט נוסף"]') as HTMLElement;
    const svg = trigger.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('calls onLoadSample when "מסמך לדוגמה" is clicked', async () => {
    const onLoadSample = vi.fn();
    act(() => {
      root = createRoot(container);
      root.render(<OverflowMenu {...defaultProps} onLoadSample={onLoadSample} />);
    });

    const trigger = container.querySelector('[aria-label="תפריט נוסף"]') as HTMLButtonElement;
    openMenu(trigger);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const menuContent = document.querySelector('[role="menu"]');
    expect(menuContent).toBeTruthy();
    const items = menuContent!.querySelectorAll('[data-slot="dropdown-menu-item"]');
    const sampleItem = Array.from(items).find((el) => el.textContent?.includes('מסמך לדוגמה'));
    expect(sampleItem).toBeTruthy();

    act(() => {
      (sampleItem as HTMLElement).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, pointerType: 'mouse' }));
    });
    act(() => {
      (sampleItem as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Callback is deferred via setTimeout
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(onLoadSample).toHaveBeenCalledTimes(1);
  });

  it('calls onClearEditor when "נקה עורך" is clicked', async () => {
    const onClearEditor = vi.fn();
    act(() => {
      root = createRoot(container);
      root.render(<OverflowMenu {...defaultProps} onClearEditor={onClearEditor} />);
    });

    const trigger = container.querySelector('[aria-label="תפריט נוסף"]') as HTMLButtonElement;
    openMenu(trigger);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const menuContent = document.querySelector('[role="menu"]');
    expect(menuContent).toBeTruthy();
    const items = menuContent!.querySelectorAll('[data-slot="dropdown-menu-item"]');
    const clearItem = Array.from(items).find((el) => el.textContent?.includes('נקה עורך'));
    expect(clearItem).toBeTruthy();

    act(() => {
      (clearItem as HTMLElement).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, pointerType: 'mouse' }));
    });
    act(() => {
      (clearItem as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(onClearEditor).toHaveBeenCalledTimes(1);
  });

  it('calls onEnterPresentation when "מצגת" is clicked', async () => {
    const onEnterPresentation = vi.fn();
    act(() => {
      root = createRoot(container);
      root.render(<OverflowMenu {...defaultProps} onEnterPresentation={onEnterPresentation} />);
    });

    const trigger = container.querySelector('[aria-label="תפריט נוסף"]') as HTMLButtonElement;
    openMenu(trigger);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const menuContent = document.querySelector('[role="menu"]');
    expect(menuContent).toBeTruthy();
    const items = menuContent!.querySelectorAll('[data-slot="dropdown-menu-item"]');
    const presentationItem = Array.from(items).find((el) => el.textContent?.includes('מצגת'));
    expect(presentationItem).toBeTruthy();

    act(() => {
      (presentationItem as HTMLElement).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, pointerType: 'mouse' }));
    });
    act(() => {
      (presentationItem as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(onEnterPresentation).toHaveBeenCalledTimes(1);
  });
});
