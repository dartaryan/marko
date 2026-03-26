'use client';
import { Search } from 'lucide-react';

interface DocumentSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function DocumentSearch({ value, onChange }: DocumentSearchProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        type="search"
        dir="auto"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="חיפוש..."
        aria-label="חיפוש מסמכים"
        className="w-full rounded-lg border border-border bg-background py-1.5 pe-3 ps-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
