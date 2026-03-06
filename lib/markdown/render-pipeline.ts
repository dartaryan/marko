import { marked } from './config';

export function renderMarkdown(content: string): string {
  if (!content.trim()) return '';
  const result = marked.parse(content);
  return typeof result === 'string' ? result : '';
}
