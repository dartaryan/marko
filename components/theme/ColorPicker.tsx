'use client';
import { useState, useEffect, useId } from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const id = useId();
  const [rawHex, setRawHex] = useState(value);

  // Sync local text state when value changes externally (e.g. theme reset, preset apply)
  useEffect(() => {
    setRawHex(value);
  }, [value]);

  function handleHexInput(raw: string) {
    setRawHex(raw);
    if (/^#[0-9A-Fa-f]{6}$/.test(raw)) {
      onChange(raw);
    }
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <label htmlFor={id} className="flex-1 truncate text-sm text-foreground" dir="rtl">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded border border-border bg-transparent p-0.5"
          aria-label={label}
        />
        <input
          type="text"
          value={rawHex}
          onChange={(e) => handleHexInput(e.target.value)}
          className="w-20 rounded border border-border px-2 py-1 font-mono text-xs"
          maxLength={7}
          aria-label={`${label} - ערך hex`}
          dir="ltr"
        />
      </div>
    </div>
  );
}
