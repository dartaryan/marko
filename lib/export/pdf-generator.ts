export async function generatePdf(element: HTMLElement, filename: string): Promise<void> {
  const html2pdfLib = await import('html2pdf.js');
  const html2pdf = html2pdfLib.default;

  // Inject page-break styles for smart pagination
  const style = document.createElement('style');
  style.textContent = [
    'h1,h2,h3{page-break-after:avoid}',
    'pre,table,blockquote,figure{page-break-inside:avoid}',
    'img{page-break-inside:avoid;max-width:100%}',
  ].join('');
  element.prepend(style);

  const opt = {
    margin: [15, 15, 15, 15] as [number, number, number, number], // mm: top, right, bottom, left
    filename: `${filename}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.95 },
    html2canvas: {
      scale: 2, // 2x resolution for crisp text
      useCORS: true, // Allow cross-origin images
      logging: false,
      letterRendering: true,
    },
    jsPDF: {
      unit: 'mm' as const,
      format: 'a4' as const,
      orientation: 'portrait' as const,
    },
    pagebreak: { mode: ['css', 'legacy'] as const },
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } finally {
    style.remove();
  }
}
