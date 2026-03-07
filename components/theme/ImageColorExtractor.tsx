'use client';
import { useRef, useState } from 'react';
import {
  getLuminance,
  mapExtractedColors,
  quantizeColors,
} from '@/lib/colors/image-extraction';
import type { RGB } from '@/lib/colors/image-extraction';
import type { ColorTheme } from '@/types/colors';
import { ColorPreviewModal } from './ColorPreviewModal';

interface ImageColorExtractorProps {
  onApply: (theme: ColorTheme) => void;
}

export function ImageColorExtractor({ onApply }: ImageColorExtractorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  const [extractedColors, setExtractedColors] = useState<RGB[]>([]);
  const [shuffleIndex, setShuffleIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onerror = () => {
      console.warn('marko: failed to read image file');
    };
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => {
        console.warn('marko: failed to decode image');
      };
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const pixels: RGB[] = [];
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          pixels.push([data[i], data[i + 1], data[i + 2]]);
        }

        const colors = quantizeColors(pixels, 6);
        colors.sort((a, b) => getLuminance(a) - getLuminance(b));
        setExtractedColors(colors);
        setShuffleIndex(0);
        setIsModalOpen(true);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset so same file can be re-selected
  }

  const colorMapping =
    extractedColors.length > 0
      ? mapExtractedColors(extractedColors, shuffleIndex)
      : null;

  function handleClose() {
    setIsModalOpen(false);
    setExtractedColors([]);
    setShuffleIndex(0);
    // Return focus to upload button (AC7)
    uploadButtonRef.current?.focus();
  }

  return (
    <>
      {/* Visually hidden label for the file input (accessibility) */}
      <label htmlFor="imageColorInput" className="sr-only">
        בחר תמונה לחילוץ צבעים
      </label>
      <input
        type="file"
        id="imageColorInput"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
      <button
        ref={uploadButtonRef}
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex w-full items-center gap-2 rounded border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="העלה תמונה לחילוץ צבעים"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        העלה תמונה
      </button>

      {colorMapping && (
        <ColorPreviewModal
          isOpen={isModalOpen}
          colorMapping={colorMapping}
          extractedColors={extractedColors}
          onShuffle={() =>
            setShuffleIndex((i) => (i + 1) % extractedColors.length)
          }
          onApply={() => {
            onApply(colorMapping);
            handleClose();
          }}
          onCancel={handleClose}
        />
      )}
    </>
  );
}
