import { vi, describe, it, expect, beforeEach } from 'vitest';

const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

import { exportMarkdown } from './md-generator';

describe('exportMarkdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createObjectURLSpy.mockReturnValue('blob:mock-url');
    revokeObjectURLSpy.mockImplementation(() => {});
    clickSpy.mockImplementation(() => {});
  });

  it('Blob contains the raw markdown content (not rendered HTML)', async () => {
    const content = '# Hello\n\nSome **bold** text';
    exportMarkdown(content, 'test');
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(await blob.text()).toBe(content);
  });

  it('Blob content does not contain <html> tag (raw markdown only)', async () => {
    exportMarkdown('# Hello', 'test');
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(await blob.text()).not.toContain('<html>');
  });

  it('downloads file with .md extension', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    exportMarkdown('content', 'my-notes');
    const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.download).toBe('my-notes.md');
    appendSpy.mockRestore();
  });

  it('calls URL.revokeObjectURL for cleanup', () => {
    exportMarkdown('', 'test');
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });
});
