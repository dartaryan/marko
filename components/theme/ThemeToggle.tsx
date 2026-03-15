'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/hooks/useTheme';

export function ThemeToggle() {
  const [isDark, toggleTheme] = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
      title={isDark ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
      suppressHydrationWarning
      className="flex h-7 w-7 items-center justify-center rounded text-emerald-100 hover:bg-white/15 hover:text-white active:scale-[0.97] transition-colors"
    >
      {isDark ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
