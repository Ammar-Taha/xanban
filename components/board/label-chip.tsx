"use client";

import { cn } from "@/lib/utils";

/** Relative luminance for hex; use dark text when background is light. */
function isLightHex(hex: string): boolean {
  const m = hex.replace(/^#/, "").match(/^([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);
  if (!m) return false;
  const [r, g, b] = [m[1], m[2], m[3]].map((x) => parseInt(x, 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6;
}

type LabelChipProps = {
  name: string;
  color: string | null;
  className?: string;
  small?: boolean;
};

export function LabelChip({ name, color, className, small }: LabelChipProps) {
  const bg = color ?? "var(--board-line)";
  const isLight = typeof bg === "string" && bg.startsWith("#") && isLightHex(bg);
  const textClass = isLight ? "text-[var(--color-xanban-black)]" : "text-white";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 font-medium",
        small ? "text-[10px] leading-tight" : "text-[11px] leading-[1.4]",
        textClass,
        className
      )}
      style={{ backgroundColor: bg }}
    >
      {name}
    </span>
  );
}
