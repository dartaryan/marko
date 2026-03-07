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
    margin: [15, 15, 15, 15], // mm: top, right, bottom, left
    filename: `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: {
      scale: 2, // 2x resolution for crisp text
      useCORS: true, // Allow cross-origin images
      logging: false,
      letterRendering: true,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
    pagebreak: { mode: ['css', 'legacy'] },
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } finally {
    style.remove();
  }
}
