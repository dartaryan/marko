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
      className="marko-header-btn"
    >
      {isDark ? (
        <Sun className="size-5" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </button>
  );
}
