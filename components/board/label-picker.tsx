"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Label } from "@/lib/labels";
import { DEFAULT_LABEL_COLOR } from "@/lib/labels";
import { ColumnColorPicker } from "@/components/board/column-color-picker";
import { LabelChip } from "@/components/board/label-chip";
import { ChevronDown, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type LabelPickerProps = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  className?: string;
};

export function LabelPicker({
  selectedIds,
  onChange,
  disabled,
  className,
}: LabelPickerProps) {
  const { user } = useAuth();
  const [labels, setLabels] = useState<Label[]>([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(DEFAULT_LABEL_COLOR);

  const fetchLabels = useCallback(async () => {
    if (!user?.id) return;
    const supabase = createClient();
    const { data } = (await supabase
      .from("labels")
      .select("id, user_id, name, color, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })) as { data: Label[] | null };
    setLabels(data ?? []);
  }, [user?.id]);

  useEffect(() => {
    if (open && user?.id) fetchLabels();
  }, [open, user?.id, fetchLabels]);

  const selectedLabels = labels.filter((l) => selectedIds.includes(l.id));
  const toggleLabel = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter((x) => x !== id));
      } else {
        onChange([...selectedIds, id]);
      }
    },
    [selectedIds, onChange]
  );

  const handleCreate = useCallback(async () => {
    const name = newName.trim();
    if (!name || !user?.id) return;
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase types incomplete
    const { data: row, error } = (await (supabase.from("labels") as any)
      .insert({ user_id: user.id, name, color: newColor })
      .select("id")
      .single()) as { data: { id: string } | null; error: { message: string } | null };
    if (error) return;
    setNewName("");
    setNewColor(DEFAULT_LABEL_COLOR);
    setCreating(false);
    await fetchLabels();
    if (row?.id) onChange([...selectedIds, row.id]);
  }, [newName, newColor, user?.id, selectedIds, onChange, fetchLabels]);

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-[12px] font-bold leading-[1.26] text-[var(--board-text-muted)]">
        Labels
      </label>
      <div className="flex flex-wrap gap-2">
        {selectedLabels.map((l) => (
          <span
            key={l.id}
            className="inline-flex items-center gap-1 rounded bg-[var(--board-bg)] pl-1 pr-2 py-0.5"
          >
            <LabelChip name={l.name} color={l.color} small />
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange(selectedIds.filter((x) => x !== l.id))}
                className="rounded p-0.5 text-[var(--board-text-muted)] hover:bg-[var(--board-line)] hover:text-[var(--board-text)]"
                aria-label={`Remove ${l.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex h-7 items-center gap-1 rounded border border-dashed border-[var(--board-line)] bg-[var(--board-header-bg)] px-2 text-[12px] font-medium text-[var(--board-text-muted)] hover:border-[#635FC7] hover:text-[#635FC7]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add label
            </button>
            {open && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => {
                    setOpen(false);
                    setCreating(false);
                  }}
                />
                <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-[var(--board-line)] bg-[var(--board-header-bg)] py-2 shadow-lg">
                  {labels.length > 0 && (
                    <div className="max-h-40 overflow-auto px-2">
                      {labels.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => {
                            toggleLabel(l.id);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[13px]",
                            selectedIds.includes(l.id)
                              ? "bg-[var(--color-xanban-primary)]/10 text-[var(--color-xanban-primary)]"
                              : "text-[var(--board-text)] hover:bg-[var(--board-bg)]"
                          )}
                        >
                          <LabelChip name={l.name} color={l.color} small />
                        </button>
                      ))}
                    </div>
                  )}
                  {!creating ? (
                    <button
                      type="button"
                      onClick={() => setCreating(true)}
                      className="mt-1 flex w-full items-center gap-2 px-2 py-1.5 text-[13px] font-medium text-[var(--color-xanban-primary)] hover:bg-[var(--board-bg)]"
                    >
                      <Plus className="h-4 w-4" />
                      Create new label
                    </button>
                  ) : (
                    <div className="mt-2 space-y-2 border-t border-[var(--board-line)] px-2 pt-2">
                      <input
                        type="text"
                        placeholder="Label name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="h-8 w-full rounded border border-[var(--board-line)] bg-[var(--board-bg)] px-2 text-[13px] focus:border-[#635FC7] focus:outline-none"
                      />
                      <ColumnColorPicker
                        value={newColor}
                        onChange={setNewColor}
                        showHex={false}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCreate}
                          className="rounded bg-[#635FC7] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#A8A4FF]"
                        >
                          Create
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCreating(false);
                            setNewName("");
                          }}
                          className="rounded border border-[var(--board-line)] px-3 py-1.5 text-[12px] font-medium text-[var(--board-text)] hover:bg-[var(--board-bg)]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
