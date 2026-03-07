import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_CLASSIC_THEME } from '@/lib/colors/defaults';

// ClipboardItem and navigator.clipboard are only accessed inside function bodies,
// not at module evaluation time. Mocks must be in place before test functions call
// copyForWord/copyHtml/copyText — which they are, since these run after module-level setup.
const clipboardWriteSpy = vi.fn().mockResolvedValue(undefined);
const clipboardWriteTextSpy = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(global.navigator, 'clipboard', {
  value: { write: clipboardWriteSpy, writeText: clipboardWriteTextSpy },
  writable: true,
});
global.ClipboardItem = class MockClipboardItem {
  constructor(public data: Record<string, Blob>) {}
} as unknown as typeof ClipboardItem;

import { copyForWord, copyHtml, copyText } from './word-copy';

async function getBlobText(spy: typeof clipboardWriteSpy): Promise<string> {
  const clipboardItem = spy.mock.calls[0][0][0] as { data: Record<string, Blob> };
  const blob = clipboardItem.data['text/html'];
  return blob.text();
}

describe('copyForWord', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('calls navigator.clipboard.write once', async () => {
    await copyForWord('# Hello', DEFAULT_CLASSIC_THEME, 'rtl');
    expect(clipboardWriteSpy).toHaveBeenCalledTimes(1);
  });

  it('passes a ClipboardItem with text/html key', async () => {
    await copyForWord('hello', DEFAULT_CLASSIC_THEME, 'rtl');
    const item = clipboardWriteSpy.mock.calls[0][0][0] as { data: Record<string, Blob> };
    expect(item.data['text/html']).toBeInstanceOf(Blob);
  });

  it('blob contains literal hex value from theme (no var reference)', async () => {
    await copyForWord('', DEFAULT_CLASSIC_THEME, 'rtl');
    const html = await getBlobText(clipboardWriteSpy);
    expect(html).toContain(DEFAULT_CLASSIC_THEME.primaryText);
    expect(html).not.toContain('var(--color-');
  });

  it('blob contains dir="rtl" when dir is rtl', async () => {
    await copyForWord('', DEFAULT_CLASSIC_THEME, 'rtl');
    expect(await getBlobText(clipboardWriteSpy)).toContain('dir="rtl"');
  });

  it('blob contains dir="ltr" when dir is ltr', async () => {
    await copyForWord('', DEFAULT_CLASSIC_THEME, 'ltr');
    expect(await getBlobText(clipboardWriteSpy)).toContain('dir="ltr"');
  });

  it('does not contain logical CSS properties (Word compatibility guard)', async () => {
    await copyForWord('', DEFAULT_CLASSIC_THEME, 'rtl');
    const html = await getBlobText(clipboardWriteSpy);
    expect(html).not.toContain('border-inline-start');
    expect(html).not.toContain('padding-inline-start');
    expect(html).not.toContain('text-align: start');
  });
});

describe('copyHtml', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('calls navigator.clipboard.write once', async () => {
    await copyHtml('# Hello', DEFAULT_CLASSIC_THEME, 'rtl');
    expect(clipboardWriteSpy).toHaveBeenCalledTimes(1);
  });

  it('blob contains CSS var references (browser-compatible)', async () => {
    await copyHtml('', DEFAULT_CLASSIC_THEME, 'rtl');
    expect(await getBlobText(clipboardWriteSpy)).toContain('var(--color-');
  });

  it('blob contains dir="rtl" when dir is rtl', async () => {
    await copyHtml('', DEFAULT_CLASSIC_THEME, 'rtl');
    expect(await getBlobText(clipboardWriteSpy)).toContain('dir="rtl"');
  });

  it('blob contains dir="ltr" when dir is ltr', async () => {
    await copyHtml('', DEFAULT_CLASSIC_THEME, 'ltr');
    expect(await getBlobText(clipboardWriteSpy)).toContain('dir="ltr"');
  });
});

describe('copyText', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('calls navigator.clipboard.writeText with raw content', async () => {
    const content = '# Hello\n\nSome **bold** text';
    await copyText(content);
    expect(clipboardWriteTextSpy).toHaveBeenCalledWith(content);
  });

  it('does NOT call navigator.clipboard.write (no ClipboardItem)', async () => {
    await copyText('test');
    expect(clipboardWriteSpy).not.toHaveBeenCalled();
  });
});
