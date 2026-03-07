import { describe, it, expect } from 'vitest';
import { getFirstHeading } from './filename-utils';

describe('getFirstHeading', () => {
  it('returns slug from H1 heading with spaces', () => {
    expect(getFirstHeading('# My Document\n\nContent')).toBe('My-Document');
  });

  it('returns slug from H2 heading', () => {
    expect(getFirstHeading('## Section Title')).toBe('Section-Title');
  });

  it('returns markdown-document for H3 heading', () => {
    expect(getFirstHeading('### Sub Section')).toBe('markdown-document');
  });

  it('strips invalid filename characters', () => {
    // covers all chars in <> : " / \ | ? *
    expect(getFirstHeading('# Hello:World<Test>"path/to\\file|name?*')).toBe('HelloWorldTestpathtofilename');
  });

  it('truncates to 50 characters', () => {
    const longHeading = '# ' + 'A'.repeat(60);
    expect(getFirstHeading(longHeading)).toHaveLength(50);
  });

  it('returns markdown-document for empty string content', () => {
    expect(getFirstHeading('')).toBe('markdown-document');
  });

  it('returns markdown-document for content with no heading lines', () => {
    expect(getFirstHeading('Just some text\nNo headings here')).toBe('markdown-document');
  });

  it('trims leading/trailing spaces in heading text before slugification', () => {
    expect(getFirstHeading('#   Padded Title   ')).toBe('Padded-Title');
  });
});
