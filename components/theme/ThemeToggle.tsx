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
      className="flex h-8 w-8 items-center justify-center rounded-md text-[#a7f3d0] hover:bg-[rgba(110,231,183,0.2)] hover:text-white active:scale-[0.97] transition-colors"
    >
      {isDark ? (
        <Sun className="size-5" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </button>
  );
}
