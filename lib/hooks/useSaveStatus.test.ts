import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { useSaveStatus } from './useSaveStatus';

// Helper to test the hook via a minimal component wrapper.
function createHookRenderer() {
  let hookResult: ReturnType<typeof useSaveStatus>;
  function TestComponent() {
    hookResult = useSaveStatus(); // eslint-disable-line react-hooks/globals
    return null;
  }
  return {
    TestComponent,
    getResult: () => hookResult,
  };
}

describe('useSaveStatus', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  it('starts with idle status', () => {
    const { TestComponent, getResult } = createHookRenderer();
    act(() => root.render(React.createElement(TestComponent)));
    expect(getResult().status).toBe('idle');
  });

  it('transitions to saving on startSave', () => {
    const { TestComponent, getResult } = createHookRenderer();
    act(() => root.render(React.createElement(TestComponent)));
    act(() => getResult().startSave());
    expect(getResult().status).toBe('saving');
  });

  it('transitions to saved on completeSave, then idle after 2s', () => {
    const { TestComponent, getResult } = createHookRenderer();
    act(() => root.render(React.createElement(TestComponent)));
    act(() => getResult().startSave());
    act(() => getResult().completeSave());
    expect(getResult().status).toBe('saved');

    act(() => vi.advanceTimersByTime(1999));
    expect(getResult().status).toBe('saved');

    act(() => vi.advanceTimersByTime(1));
    expect(getResult().status).toBe('idle');
  });

  it('transitions to error on failSave, then idle after 5s', () => {
    const { TestComponent, getResult } = createHookRenderer();
    act(() => root.render(React.createElement(TestComponent)));
    act(() => getResult().startSave());
    act(() => getResult().failSave());
    expect(getResult().status).toBe('error');

    act(() => vi.advanceTimersByTime(4999));
    expect(getResult().status).toBe('error');

    act(() => vi.advanceTimersByTime(1));
    expect(getResult().status).toBe('idle');
  });

  it('cancels saved fade timer when startSave is called during saved state', () => {
    const { TestComponent, getResult } = createHookRenderer();
    act(() => root.render(React.createElement(TestComponent)));
    act(() => getResult().startSave());
    act(() => getResult().completeSave());
    expect(getResult().status).toBe('saved');

    act(() => vi.advanceTimersByTime(1000));
    act(() => getResult().startSave());
    expect(getResult().status).toBe('saving');

    // Original 2s elapsed — should still be saving, not idle
    act(() => vi.advanceTimersByTime(1000));
    expect(getResult().status).toBe('saving');
  });

  it('clears timers on unmount', () => {
    const { TestComponent, getResult } = createHookRenderer();
    act(() => root.render(React.createElement(TestComponent)));
    act(() => getResult().startSave());
    act(() => getResult().completeSave());
    expect(getResult().status).toBe('saved');

    act(() => root.unmount());
    // Should not throw
    act(() => vi.advanceTimersByTime(3000));
  });
});
