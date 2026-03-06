'use client';

interface FormatButtonProps {
  onClick: () => void;
  ariaLabel: string;
  title?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export function FormatButton({ onClick, ariaLabel, title, disabled, children }: FormatButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground
                 hover:bg-muted hover:text-foreground active:scale-[0.97]
                 transition-colors disabled:pointer-events-none disabled:opacity-50"
    >
      {children}
    </button>
  );
}
