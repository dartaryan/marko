import { marked } from './config';
import { applyBidiToHtml } from '@/lib/bidi/apply-bidi';

export function renderMarkdown(content: string, autoBidi = false): string {
  if (!content.trim()) return '';
  const result = marked.parse(content);
  const html = typeof result === 'string' ? result : '';
  return autoBidi ? applyBidiToHtml(html) : html;
}
