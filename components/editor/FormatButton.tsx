'use client';

interface FormatButtonProps {
  onClick: () => void;
  ariaLabel: string;
  title?: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormatButton({ onClick, ariaLabel, title, disabled, className, children }: FormatButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      className={`marko-toolbar-btn h-8 w-8 disabled:pointer-events-none disabled:opacity-50${className ? ` ${className}` : ''}`}
    >
      {children}
    </button>
  );
}
