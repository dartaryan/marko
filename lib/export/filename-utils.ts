export function getFirstHeading(content: string): string {
  const match = content.match(/^#{1,2}\s+(.+)$/m); // 'm' flag required for per-line ^ matching
  if (match) {
    const slug = match[1]
      .trim()
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    return slug || 'markdown-document';
  }
  return 'markdown-document';
}
