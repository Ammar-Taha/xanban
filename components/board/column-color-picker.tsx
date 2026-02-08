"use client";

import { cn } from "@/lib/utils";

const DEFAULT_COLUMN_COLOR = "#635FC7";
const HEX_REGEX = /^#([0-9A-Fa-f]{6})$/;

function normalizeHex(value: string): string {
  const v = value.trim();
  if (v.startsWith("#")) return v;
  if (/^[0-9A-Fa-f]{6}$/.test(v)) return `#${v}`;
  return "";
}

type ColumnColorPickerProps = {
  value: string;
  onChange: (hex: string) => void;
  className?: string;
  /** Show hex text input for typing/paste */
  showHex?: boolean;
};

export function ColumnColorPicker({
  value,
  onChange,
  className,
  showHex = true,
}: ColumnColorPickerProps) {
  const hex = value && HEX_REGEX.test(value) ? value : DEFAULT_COLUMN_COLOR;
  const displayHex = value && HEX_REGEX.test(value) ? value : "";

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v) onChange(v);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange("");
      return;
    }
    const normalized = normalizeHex(raw);
    if (normalized) onChange(normalized);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        type="color"
        value={hex}
        onChange={handleColorChange}
        className="h-9 w-9 cursor-pointer rounded border border-[var(--board-line)] bg-transparent p-0.5 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-moz-color-swatch]:rounded"
        aria-label="Column color"
        title="Pick color"
      />
      {showHex && (
        <input
          type="text"
          value={displayHex}
          onChange={handleHexChange}
          placeholder="#635FC7"
          maxLength={7}
          className="w-20 rounded border border-[var(--board-line)] bg-[var(--board-header-bg)] px-2 py-1.5 text-[12px] font-medium text-[var(--board-text)] placeholder:text-[var(--board-text-muted)] focus:border-[#635FC7] focus:outline-none focus:ring-1 focus:ring-[#635FC7]"
          aria-label="Hex color"
        />
      )}
    </div>
  );
}
