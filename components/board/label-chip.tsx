"use client";

import { cn } from "@/lib/utils";

type LabelChipProps = {
  name: string;
  color: string | null;
  className?: string;
  small?: boolean;
};

export function LabelChip({ name, color, className, small }: LabelChipProps) {
  const bg = color ?? "var(--board-line)";
  const isLight =
    typeof bg === "string" &&
    bg.startsWith("#") &&
    (bg === "#F2C94C" ||
      bg === "#67E2AE" ||
      bg === "#49C4E5" ||
      bg === "#FF9F1A");
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
