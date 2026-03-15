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
      <label htmlFor={id} className="flex-1 truncate text-[var(--foreground)]" dir="rtl" style={{ fontSize: 'var(--text-body-sm)' }}>
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="marko-color-swatch"
          aria-label={label}
        />
        <input
          type="text"
          value={rawHex}
          onChange={(e) => handleHexInput(e.target.value)}
          className="marko-hex-input"
          maxLength={7}
          aria-label={`${label} - ערך hex`}
          dir="ltr"
        />
      </div>
    </div>
  );
}
