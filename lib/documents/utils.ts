/**
 * Extract document title from markdown content.
 * Priority: first H1 heading > first non-empty line > fallback Hebrew default.
 */
export function getDocumentTitle(content: string): string {
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();

  const firstLine = content.split('\n').find((line) => line.trim().length > 0);
  if (firstLine) return firstLine.trim().slice(0, 60);

  return 'מסמך חדש';
}

/**
 * Extract a plain-text snippet from markdown content (~60 chars).
 * Strips headings, formatting, and links.
 */
export function getDocumentSnippet(content: string): string {
  const stripped = content
    .replace(/^#+ .+$/gm, '')
    .replace(/[*_~`>]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
  return stripped.slice(0, 60) + (stripped.length > 60 ? '...' : '');
}

/**
 * Return a Hebrew relative date string for a given timestamp.
 */
export function getRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  if (diffMs < 0) return 'היום';
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'היום';
  if (diffDays === 1) return 'אתמול';
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  const weeks = Math.floor(diffDays / 7);
  if (diffDays < 30) return weeks === 1 ? 'לפני שבוע' : `לפני ${weeks} שבועות`;
  const months = Math.floor(diffDays / 30);
  return months === 1 ? 'לפני חודש' : `לפני ${months} חודשים`;
}
