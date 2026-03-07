import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_CLASSIC_THEME } from '@/lib/colors/defaults';

// Spy on URL methods before importing the module
const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

import { exportHtml } from './html-generator';

describe('exportHtml', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createObjectURLSpy.mockReturnValue('blob:mock-url');
    revokeObjectURLSpy.mockImplementation(() => {});
    clickSpy.mockImplementation(() => {});
  });

  async function getCapturedHtml(): Promise<string> {
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    return blob.text();
  }

  it('contains DOCTYPE html', async () => {
    exportHtml('# Hello', DEFAULT_CLASSIC_THEME, 'rtl', 'test');
    expect(await getCapturedHtml()).toContain('<!DOCTYPE html>');
  });

  it('contains charset UTF-8', async () => {
    exportHtml('# Hello', DEFAULT_CLASSIC_THEME, 'rtl', 'test');
    expect(await getCapturedHtml()).toContain('charset="UTF-8"');
  });

  it('embeds all 17 theme color values in :root block', async () => {
    exportHtml('', DEFAULT_CLASSIC_THEME, 'rtl', 'test');
    const html = await getCapturedHtml();
    const t = DEFAULT_CLASSIC_THEME;
    expect(html).toContain(t.primaryText);
    expect(html).toContain(t.secondaryText);
    expect(html).toContain(t.link);
    expect(html).toContain(t.code);
    expect(html).toContain(t.h1);
    expect(html).toContain(t.h1Border);
    expect(html).toContain(t.h2);
    expect(html).toContain(t.h2Border);
    expect(html).toContain(t.h3);
    expect(html).toContain(t.previewBg);
    expect(html).toContain(t.codeBg);
    expect(html).toContain(t.blockquoteBg);
    expect(html).toContain(t.tableHeader);
    expect(html).toContain(t.tableAlt);
    expect(html).toContain(t.blockquoteBorder);
    expect(html).toContain(t.hr);
    expect(html).toContain(t.tableBorder);
  });

  it('sets dir="rtl" on html element when dir is rtl', async () => {
    exportHtml('', DEFAULT_CLASSIC_THEME, 'rtl', 'test');
    expect(await getCapturedHtml()).toContain('<html lang="he" dir="rtl">');
  });

  it('sets dir="ltr" on html element when dir is ltr', async () => {
    exportHtml('', DEFAULT_CLASSIC_THEME, 'ltr', 'test');
    expect(await getCapturedHtml()).toContain('<html lang="he" dir="ltr">');
  });

  it('sets --doc-direction CSS var to match dir parameter', async () => {
    exportHtml('', DEFAULT_CLASSIC_THEME, 'ltr', 'test');
    expect(await getCapturedHtml()).toContain('--doc-direction: ltr');
  });

  it('sets <title> to filename', async () => {
    exportHtml('', DEFAULT_CLASSIC_THEME, 'rtl', 'my-report');
    expect(await getCapturedHtml()).toContain('<title>my-report</title>');
  });

  it('downloads file with .html extension', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    exportHtml('', DEFAULT_CLASSIC_THEME, 'rtl', 'my-doc');
    const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.download).toBe('my-doc.html');
    appendSpy.mockRestore();
  });

  it('HTML contains rendered markdown (h1 tag from # heading)', async () => {
    exportHtml('# Hello World', DEFAULT_CLASSIC_THEME, 'rtl', 'test');
    const html = await getCapturedHtml();
    expect(html).toContain('<h1>');
  });

  it('calls URL.revokeObjectURL for cleanup', () => {
    exportHtml('', DEFAULT_CLASSIC_THEME, 'rtl', 'test');
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });
});
