'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { rgbToHex } from '@/lib/colors/image-extraction';
import type { ColorTheme } from '@/types/colors';
import type { RGB } from '@/lib/colors/image-extraction';

interface ColorPreviewModalProps {
  isOpen: boolean;
  colorMapping: ColorTheme;
  extractedColors: RGB[];
  onShuffle: () => void;
  onApply: () => void;
  onCancel: () => void;
}

export function ColorPreviewModal({
  isOpen,
  colorMapping: m,
  extractedColors,
  onShuffle,
  onApply,
  onCancel,
}: ColorPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle>תצוגה מקדימה של צבעים</DialogTitle>
        </DialogHeader>

        {/* Extracted colors strip — 6 circles */}
        <div className="flex justify-center gap-2 py-2" aria-hidden="true">
          {extractedColors.map((c, i) => (
            <div
              key={i}
              className="h-8 w-8 rounded-full border-2 border-border"
              style={{ background: rgbToHex(c) }}
              title={rgbToHex(c)}
            />
          ))}
        </div>

        {/* Mock document preview */}
        <div
          role="img"
          aria-label="תצוגה מקדימה של נושא הצבעים המחולץ"
          className="rounded-xl border border-border p-4"
          style={{ background: m.previewBg, direction: 'rtl' }}
        >
          {/* H1 */}
          <div className="mb-1.5 h-3.5 w-3/5 rounded" style={{ background: m.h1 }} />
          {/* H1 border */}
          <div className="mb-3 h-0.5 w-full rounded" style={{ background: m.h1Border }} />
          {/* Text lines */}
          <div className="mb-3 flex flex-col gap-1">
            <div className="h-2 w-full rounded" style={{ background: m.secondaryText + '40' }} />
            <div className="h-2 w-11/12 rounded" style={{ background: m.secondaryText + '30' }} />
            <div className="h-2 w-4/5 rounded" style={{ background: m.secondaryText + '35' }} />
          </div>
          {/* H2 */}
          <div className="mb-1 h-3 w-2/5 rounded" style={{ background: m.h2 }} />
          {/* H2 border */}
          <div className="mb-2.5 h-0.5 w-full rounded" style={{ background: m.h2Border }} />
          {/* Blockquote */}
          <div
            className="mb-2.5 flex gap-2 rounded-lg p-2"
            style={{ background: m.blockquoteBg }}
          >
            <div className="w-1 min-h-6 rounded" style={{ background: m.blockquoteBorder }} />
            <div className="flex flex-1 flex-col gap-1">
              <div className="h-1.5 w-4/5 rounded" style={{ background: m.secondaryText + '30' }} />
              <div className="h-1.5 w-3/5 rounded" style={{ background: m.secondaryText + '25' }} />
            </div>
          </div>
          {/* Table */}
          <div className="mb-2.5 overflow-hidden rounded-lg">
            <div
              className="flex items-center px-2"
              style={{ background: m.tableHeader, height: '20px' }}
            >
              <div className="h-1.5 w-1/3 rounded" style={{ background: 'rgba(255,255,255,0.5)' }} />
            </div>
            <div
              className="h-4 border-b"
              style={{ background: m.previewBg, borderColor: m.tableBorder }}
            />
            <div className="h-4" style={{ background: m.tableAlt }} />
          </div>
          {/* Code block */}
          <div className="mb-2.5 h-8 rounded-lg" style={{ background: m.codeBg }} />
          {/* HR */}
          <div className="h-0.5 rounded" style={{ background: m.hr }} />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onApply}
            className="rounded border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="החל צבעים על המסמך"
          >
            החל צבעים
          </button>
          <button
            type="button"
            onClick={onShuffle}
            className="rounded border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="ערבב מיפוי הצבעים"
          >
            ערבב
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="ביטול חילוץ הצבעים"
          >
            ביטול
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
