import { vi, describe, it, expect, beforeEach } from 'vitest';

const { mockSave, mockFrom, mockSet, mockHtml2pdf } = vi.hoisted(() => {
  const mockSave = vi.fn().mockResolvedValue(undefined);
  const mockFrom = vi.fn().mockReturnValue({ save: mockSave });
  const mockSet = vi.fn().mockReturnValue({ from: mockFrom });
  const mockHtml2pdf = vi.fn().mockReturnValue({ set: mockSet });
  return { mockSave, mockFrom, mockSet, mockHtml2pdf };
});

vi.mock('html2pdf.js', () => ({ default: mockHtml2pdf }));

import { generatePdf } from './pdf-generator';

describe('generatePdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSave.mockResolvedValue(undefined);
    mockFrom.mockReturnValue({ save: mockSave });
    mockSet.mockReturnValue({ from: mockFrom });
    mockHtml2pdf.mockReturnValue({ set: mockSet });
  });

  it('appends .pdf to the filename', async () => {
    const el = document.createElement('div');
    await generatePdf(el, 'my-document');
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ filename: 'my-document.pdf' })
    );
  });

  it('uses A4 format', async () => {
    const el = document.createElement('div');
    await generatePdf(el, 'test');
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ jsPDF: expect.objectContaining({ format: 'a4' }) })
    );
  });

  it('uses scale: 2 for high-resolution output', async () => {
    const el = document.createElement('div');
    await generatePdf(el, 'test');
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ html2canvas: expect.objectContaining({ scale: 2 }) })
    );
  });

  it('uses css and legacy pagebreak modes', async () => {
    const el = document.createElement('div');
    await generatePdf(el, 'test');
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ pagebreak: { mode: ['css', 'legacy'] } })
    );
  });

  it('uses 15mm margins on all sides', async () => {
    const el = document.createElement('div');
    await generatePdf(el, 'test');
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ margin: [15, 15, 15, 15] })
    );
  });

  it('calls .from() with the provided element', async () => {
    const el = document.createElement('div');
    await generatePdf(el, 'test');
    expect(mockFrom).toHaveBeenCalledWith(el);
  });

  it('calls .save() to trigger download', async () => {
    const el = document.createElement('div');
    await generatePdf(el, 'test');
    expect(mockSave).toHaveBeenCalled();
  });

  it('propagates rejection when html2pdf fails', async () => {
    mockSave.mockRejectedValueOnce(new Error('PDF generation failed'));
    const el = document.createElement('div');
    await expect(generatePdf(el, 'test')).rejects.toThrow('PDF generation failed');
  });

  it('injects a <style> element before calling html2pdf', async () => {
    const el = document.createElement('div');
    let styleExistedDuringCall = false;
    mockHtml2pdf.mockImplementationOnce(() => {
      styleExistedDuringCall = el.querySelector('style') !== null;
      return { set: mockSet };
    });
    await generatePdf(el, 'test');
    expect(styleExistedDuringCall).toBe(true);
  });

  it('removes the injected <style> after generation', async () => {
    const el = document.createElement('div');
    await generatePdf(el, 'test');
    expect(el.querySelector('style')).toBeNull();
  });

  it('removes the injected <style> even when html2pdf fails', async () => {
    mockSave.mockRejectedValueOnce(new Error('fail'));
    const el = document.createElement('div');
    await generatePdf(el, 'test').catch(() => {});
    expect(el.querySelector('style')).toBeNull();
  });
});
