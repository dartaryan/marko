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
      className="marko-toolbar-btn flex h-8 w-8 items-center justify-center rounded-md
                 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
    >
      {children}
    </button>
  );
}
