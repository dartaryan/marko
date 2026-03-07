import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { ExportModal } from './ExportModal';

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
  container.remove();
  vi.clearAllMocks();
});

function renderModal(overrides: {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  exportType?: 'pdf' | 'html' | 'markdown';
  content?: string;
  onExport?: (filename: string, type: 'pdf' | 'html' | 'markdown') => void;
} = {}) {
  const props = {
    isOpen: true,
    onOpenChange: vi.fn(),
    exportType: 'pdf' as const,
    content: '# My Document\n\nSome content',
    onExport: vi.fn(),
    ...overrides,
  };
  act(() => {
    root = createRoot(container);
    root.render(<ExportModal {...props} />);
  });
  return props;
}

function getTextInput(): HTMLInputElement {
  return document.body.querySelector('input[type="text"]') as HTMLInputElement;
}

function changeInputValue(value: string) {
  const input = getTextInput();
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set;
  act(() => {
    nativeInputValueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('ExportModal', () => {
  it('pre-fills filename from first H1 heading in content', () => {
    renderModal();
    expect(getTextInput()?.value).toBe('My-Document');
  });

  it('shows .pdf extension label for pdf type', () => {
    renderModal({ exportType: 'pdf' });
    const extLabel = document.body.querySelector('[aria-label="סיומת הקובץ: .pdf"]');
    expect(extLabel).not.toBeNull();
    expect(extLabel?.textContent).toBe('.pdf');
  });

  it('shows .html extension label for html type', () => {
    renderModal({ exportType: 'html' });
    expect(document.body.querySelector('[aria-label="סיומת הקובץ: .html"]')).not.toBeNull();
  });

  it('shows .md extension label for markdown type', () => {
    renderModal({ exportType: 'markdown' });
    expect(document.body.querySelector('[aria-label="סיומת הקובץ: .md"]')).not.toBeNull();
  });

  it('filename input is editable', () => {
    renderModal();
    changeInputValue('custom-name');
    expect(getTextInput().value).toBe('custom-name');
  });

  it('calls onExport with filename and type when export button clicked', () => {
    const onExport = vi.fn();
    renderModal({ onExport });
    act(() => {
      document.body.querySelector<HTMLButtonElement>('button[aria-label="אשר ייצוא"]')?.click();
    });
    expect(onExport).toHaveBeenCalledWith('My-Document', 'pdf');
  });

  it('export button is disabled when filename is cleared to empty string', () => {
    renderModal();
    changeInputValue('');
    const btn = document.body.querySelector<HTMLButtonElement>('button[aria-label="אשר ייצוא"]');
    expect(btn?.disabled).toBe(true);
  });

  it('export button is disabled when filename is whitespace-only', () => {
    renderModal();
    changeInputValue('   ');
    const btn = document.body.querySelector<HTMLButtonElement>('button[aria-label="אשר ייצוא"]');
    expect(btn?.disabled).toBe(true);
  });

  it('cancel button calls onOpenChange(false) and does NOT call onExport', () => {
    const onExport = vi.fn();
    const onOpenChange = vi.fn();
    renderModal({ onExport, onOpenChange });
    act(() => {
      document.body.querySelector<HTMLButtonElement>('button[aria-label="ביטול ייצוא"]')?.click();
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onExport).not.toHaveBeenCalled();
  });

  it('pressing Enter in input calls onExport with current filename', () => {
    const onExport = vi.fn();
    renderModal({ onExport });
    act(() => {
      getTextInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    expect(onExport).toHaveBeenCalledWith('My-Document', 'pdf');
  });

  it('shows Hebrew dialog description text', () => {
    renderModal();
    const desc = Array.from(document.body.querySelectorAll('*')).find(
      (el) => el.textContent?.trim() === 'הכנס שם קובץ לייצוא המסמך' && el.children.length === 0
    );
    expect(desc).not.toBeNull();
  });

  it('clicking export button when disabled does not call onExport', () => {
    const onExport = vi.fn();
    renderModal({ onExport });
    changeInputValue('');
    act(() => {
      document.body.querySelector<HTMLButtonElement>('button[aria-label="אשר ייצוא"]')?.click();
    });
    expect(onExport).not.toHaveBeenCalled();
  });

  it('dialog title "ייצא PDF" renders for pdf type', () => {
    renderModal({ exportType: 'pdf' });
    const allText = Array.from(document.body.querySelectorAll('*')).find(
      (el) => el.textContent?.trim() === 'ייצא PDF' && el.children.length === 0
    );
    expect(allText).not.toBeNull();
  });

  it('onOpenChange(false) is called after a successful export confirm', () => {
    const onOpenChange = vi.fn();
    renderModal({ onOpenChange });
    act(() => {
      document.body.querySelector<HTMLButtonElement>('button[aria-label="אשר ייצוא"]')?.click();
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
