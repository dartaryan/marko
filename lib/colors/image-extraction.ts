import type { ColorTheme } from '@/types/colors';

export type RGB = [number, number, number];

export function getLuminance(rgb: RGB): number {
  return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
}

export function rgbToHex(rgb: RGB): string {
  return '#' + rgb.map(c => Math.round(c).toString(16).padStart(2, '0')).join('');
}

export function quantizeColors(pixels: RGB[], k: number): RGB[] {
  if (pixels.length === 0) {
    // Fallback palette matching v1 defaults
    return [[26,26,26],[61,61,61],[107,107,107],[225,5,20],[240,237,232],[248,246,243]];
  }

  // Initialize centers evenly across the pixel array
  const centers: RGB[] = [];
  const step = Math.max(1, Math.floor(pixels.length / k));
  for (let i = 0; i < k; i++) {
    centers.push([...pixels[Math.min(i * step, pixels.length - 1)]] as RGB);
  }

  // k-means: 15 iterations, convergence tolerance = 2
  for (let iter = 0; iter < 15; iter++) {
    const clusters: RGB[][] = Array.from({ length: k }, () => []);

    for (const px of pixels) {
      let minDist = Infinity, minIdx = 0;
      for (let i = 0; i < k; i++) {
        const d =
          (px[0] - centers[i][0]) ** 2 +
          (px[1] - centers[i][1]) ** 2 +
          (px[2] - centers[i][2]) ** 2;
        if (d < minDist) { minDist = d; minIdx = i; }
      }
      clusters[minIdx].push(px);
    }

    let converged = true;
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue;
      const newCenter: RGB = [0, 0, 0];
      for (const px of clusters[i]) {
        newCenter[0] += px[0]; newCenter[1] += px[1]; newCenter[2] += px[2];
      }
      newCenter[0] /= clusters[i].length;
      newCenter[1] /= clusters[i].length;
      newCenter[2] /= clusters[i].length;
      const diff =
        Math.abs(newCenter[0] - centers[i][0]) +
        Math.abs(newCenter[1] - centers[i][1]) +
        Math.abs(newCenter[2] - centers[i][2]);
      if (diff > 2) converged = false;
      centers[i] = newCenter;
    }
    if (converged) break;
  }

  // Degenerate case: all centers collapsed to same color (e.g. solid-color image)
  const allIdentical = centers.every(
    (c) =>
      Math.abs(c[0] - centers[0][0]) < 1 &&
      Math.abs(c[1] - centers[0][1]) < 1 &&
      Math.abs(c[2] - centers[0][2]) < 1
  );
  if (allIdentical) {
    return [[26,26,26],[61,61,61],[107,107,107],[225,5,20],[240,237,232],[248,246,243]];
  }

  return centers;
}

export function mapExtractedColors(extractedColors: RGB[], shuffleIndex: number): ColorTheme {
  // Sort by luminance (darkest → lightest)
  const sorted = [...extractedColors].sort((a, b) => getLuminance(a) - getLuminance(b));

  // Rotate by shuffleIndex (Shuffle button rotates mapping)
  const rotated: RGB[] = sorted.map((_, i) => sorted[(i + shuffleIndex) % sorted.length]);

  const darkest    = rgbToHex(rotated[0]);
  const secondDark = rgbToHex(rotated[1]);
  const medium     = rgbToHex(rotated[2]);
  const vibrant    = rgbToHex(rotated[3]);
  const secondLight = rgbToHex(rotated[4] ?? rotated[3]);
  const lightest   = rgbToHex(rotated[5] ?? rotated[4] ?? rotated[3]);

  const lastRgb = rotated[rotated.length - 1];
  const bgColor  = getLuminance(lastRgb) > 200 ? rgbToHex(lastRgb) : '#FFFFFF';
  const bgLight  = getLuminance(lastRgb) > 180 ? lightest : '#F5F5F5';

  return {
    primaryText:      darkest,
    secondaryText:    secondDark,
    link:             vibrant,
    code:             vibrant,
    h1:               darkest,
    h1Border:         vibrant,
    h2:               secondDark,
    h2Border:         medium,
    h3:               medium,
    previewBg:        bgColor,
    codeBg:           darkest,
    blockquoteBg:     bgLight,
    tableHeader:      vibrant,
    tableAlt:         bgLight,
    blockquoteBorder: vibrant,
    hr:               vibrant,
    tableBorder:      secondLight,
  };
}
