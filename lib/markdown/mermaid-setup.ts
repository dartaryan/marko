// lib/markdown/mermaid-setup.ts
// SSR-safe: all functions only call browser APIs inside function bodies

export function getMermaidThemeVariables(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const style = getComputedStyle(document.documentElement);
  const get = (prop: string) => style.getPropertyValue(prop).trim();
  return {
    primaryColor:          get('--color-table-header')    || '#ecfdf5',
    primaryTextColor:      get('--color-primary-text')    || '#333333',
    primaryBorderColor:    get('--color-h1-border')       || '#10B981',
    lineColor:             get('--color-h1-border')       || '#10B981',
    secondaryColor:        get('--color-blockquote-bg')   || '#f0fdf4',
    tertiaryColor:         get('--color-code-bg')         || '#f8f8f8',
    background:            get('--color-preview-bg')      || '#ffffff',
    nodeBorder:            get('--color-h2')              || '#047857',
    clusterBkg:            get('--color-table-alt')       || '#f8fafb',
    titleColor:            get('--color-h1')              || '#065f46',
    edgeLabelBackground:   get('--color-code-bg')         || '#f8f8f8',
    activeTaskBkgColor:    get('--color-h3')              || '#059669',
    activeTaskBorderColor: get('--color-h2')              || '#047857',
    fontFamily:            'var(--font-body, sans-serif)',
    fontSize:              '14px',
  };
}

export async function initializeMermaid(): Promise<void> {
  const mermaid = (await import('mermaid')).default;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',  // Prevent XSS in user-controlled diagram labels
    theme: 'base',
    themeVariables: getMermaidThemeVariables(),
    fontFamily: 'var(--font-body, sans-serif)',
    fontSize: 14,
  });
}

/** NOTE: initializeMermaid() must be called before this function on each render cycle. */
export async function runMermaid(nodes: HTMLElement[]): Promise<void> {
  const mermaid = (await import('mermaid')).default;
  await mermaid.run({ nodes });
}
