// lib/editor/format-utils.ts

export type FormatType =
  | 'bold' | 'italic' | 'strikethrough'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'ul' | 'ol' | 'task'
  | 'link' | 'image' | 'table' | 'hr'
  | 'code-inline' | 'code-block';

/**
 * Returns the Markdown string to insert.
 * If selectedText is non-empty, wraps it; else inserts a Hebrew placeholder.
 * The caller (EditorPanel.insertTextAtCursor) replaces the textarea selection
 * with this returned string.
 */
export function getFormatText(type: FormatType, selectedText: string): string {
  const sel = selectedText.trim();

  switch (type) {
    // Inline wraps
    case 'bold':          return `**${sel || 'טקסט מודגש'}**`;
    case 'italic':        return `*${sel || 'טקסט נטוי'}*`;
    case 'strikethrough': return `~~${sel || 'טקסט חצוי'}~~`;
    case 'code-inline':   return `\`${sel || 'קוד'}\``;

    // Block elements
    case 'h1': return `# ${sel || 'כותרת ראשית'}\n`;
    case 'h2': return `## ${sel || 'כותרת משנית'}\n`;
    case 'h3': return `### ${sel || 'כותרת שלישית'}\n`;
    case 'h4': return `#### ${sel || 'כותרת רביעית'}\n`;
    case 'h5': return `##### ${sel || 'כותרת חמישית'}\n`;
    case 'h6': return `###### ${sel || 'כותרת שישית'}\n`;

    case 'ul':   return `- ${sel || 'פריט רשימה'}\n`;
    case 'ol':   return `1. ${sel || 'פריט רשימה'}\n`;
    case 'task': return `- [ ] ${sel || 'משימה'}\n`;

    case 'link':  return `[${sel || 'טקסט הקישור'}](url)`;
    case 'image': return `![${sel || 'תיאור תמונה'}](url)`;
    case 'hr':    return `\n---\n`;

    case 'table':
      return `\n| כותרת א | כותרת ב | כותרת ג |\n| --- | --- | --- |\n| תא 1 | תא 2 | תא 3 |\n`;

    case 'code-block':
      return `\`\`\`\n${sel || 'קוד כאן'}\n\`\`\`\n`;

    default:
      return sel;
  }
}
