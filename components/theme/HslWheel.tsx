'use client';
import { useRef, useEffect, useCallback, useState } from 'react';
import { hslToHex, hslToRgb, hexToHsl } from '@/lib/colors/color-utils';

interface HslWheelProps {
  value: { h: number; s: number; l: number };
  onChange: (hsl: { h: number; s: number; l: number }) => void;
}

const WHEEL_SIZE = 180;
const RADIUS = WHEEL_SIZE / 2;

export function HslWheel({ value, onChange }: HslWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const [hexInput, setHexInput] = useState(() => hslToHex(value.h, value.s, value.l));

  // Sync hex input when value changes externally
  useEffect(() => {
    if (!isDragging.current) {
      setHexInput(hslToHex(value.h, value.s, value.l));
    }
  }, [value.h, value.s, value.l]);

  // Draw the HSL wheel
  const drawWheel = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const imageData = ctx.createImageData(WHEEL_SIZE, WHEEL_SIZE);
      const data = imageData.data;

      for (let y = 0; y < WHEEL_SIZE; y++) {
        for (let x = 0; x < WHEEL_SIZE; x++) {
          const dx = x - RADIUS;
          const dy = y - RADIUS;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist <= RADIUS) {
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            const hue = ((angle + 360) % 360);
            const sat = (dist / RADIUS) * 100;

            const [r, g, b] = hslToRgb(hue, sat, value.l);
            const i = (y * WHEEL_SIZE + x) * 4;
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
            data[i + 3] = 255;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Draw selection indicator
      const selAngle = (value.h * Math.PI) / 180;
      const selDist = (value.s / 100) * RADIUS;
      const sx = RADIUS + Math.cos(selAngle) * selDist;
      const sy = RADIUS + Math.sin(selAngle) * selDist;

      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
    },
    [value.h, value.s, value.l]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawWheel(ctx);
  }, [drawWheel]);

  function getHSFromPointer(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const dx = x - RADIUS;
    const dy = y - RADIUS;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), RADIUS);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    return {
      h: Math.round((angle + 360) % 360),
      s: Math.round((dist / RADIUS) * 100),
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dx = (e.clientX - rect.left) - RADIUS;
    const dy = (e.clientY - rect.top) - RADIUS;
    if (Math.sqrt(dx * dx + dy * dy) > RADIUS) return;

    isDragging.current = true;
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    const hs = getHSFromPointer(e.clientX, e.clientY);
    if (hs) onChange({ ...hs, l: value.l });
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDragging.current) return;
    const hs = getHSFromPointer(e.clientX, e.clientY);
    if (hs) onChange({ ...hs, l: value.l });
  }

  function handlePointerUp() {
    isDragging.current = false;
    setHexInput(hslToHex(value.h, value.s, value.l));
  }

  function handleLightnessChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ h: value.h, s: value.s, l: Number(e.target.value) });
  }

  function handleHexChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setHexInput(raw);
    const cleaned = raw.startsWith('#') ? raw : `#${raw}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(cleaned)) {
      const hsl = hexToHsl(cleaned);
      onChange(hsl);
    }
  }

  const currentHex = hslToHex(value.h, value.s, value.l);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        className="cursor-crosshair rounded-full"
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        aria-label="בורר גוון ורוויה"
      />

      <div className="flex w-full items-center gap-2">
        <label
          className="shrink-0 text-[var(--foreground-muted)]"
          style={{ fontSize: 'var(--text-caption)' }}
        >
          בהירות
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={value.l}
          onChange={handleLightnessChange}
          className="w-full accent-[var(--foreground)]"
          dir="ltr"
          aria-label="בהירות"
        />
      </div>

      <div className="flex w-full items-center gap-2">
        <div
          className="size-6 shrink-0 rounded border border-[var(--border)]"
          style={{ backgroundColor: currentHex }}
          aria-hidden="true"
        />
        <input
          type="text"
          value={hexInput}
          onChange={handleHexChange}
          dir="ltr"
          className="marko-panel-input w-full font-mono"
          style={{ fontSize: 'var(--text-caption)' }}
          aria-label="ערך צבע הקסדצימלי"
          maxLength={7}
        />
      </div>
    </div>
  );
}
