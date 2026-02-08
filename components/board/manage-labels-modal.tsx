"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Label } from "@/lib/labels";
import { LABEL_COLORS } from "@/lib/labels";
import { LabelChip } from "@/components/board/label-chip";
import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type ManageLabelsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ManageLabelsModal({ open, onClose }: ManageLabelsModalProps) {
  const { user } = useAuth();
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(LABEL_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

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
    if (open && user?.id) {
      setLoading(true);
      fetchLabels().finally(() => setLoading(false));
      setAdding(false);
      setEditingId(null);
    }
  }, [open, user?.id, fetchLabels]);

  const handleAdd = useCallback(async () => {
    const name = newName.trim();
    if (!name || !user?.id) return;
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase types incomplete
    await (supabase.from("labels") as any).insert({
      user_id: user.id,
      name,
      color: newColor,
    });
    setNewName("");
    setNewColor(LABEL_COLORS[0]);
    setAdding(false);
    await fetchLabels();
  }, [newName, newColor, user?.id, fetchLabels]);

  const handleUpdate = useCallback(
    async (id: string) => {
      const name = editName.trim();
      if (!name) return;
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase types incomplete
      await (supabase.from("labels") as any)
        .update({ name, color: editColor })
        .eq("id", id);
      setEditingId(null);
      await fetchLabels();
    },
    [editName, editColor, fetchLabels]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const supabase = createClient();
      await supabase.from("labels").delete().eq("id", id);
      await fetchLabels();
    },
    [fetchLabels]
  );

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" aria-hidden onClick={onClose} />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[var(--board-line)] bg-[var(--board-header-bg)] p-8 shadow-xl"
        role="dialog"
        aria-modal
        aria-labelledby="manage-labels-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2
            id="manage-labels-title"
            className="text-[18px] font-bold leading-[1.26] text-[var(--board-text)]"
          >
            Manage labels
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[var(--board-text-muted)] hover:bg-[var(--board-bg)] hover:text-[var(--board-text)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-xanban-primary)] border-t-transparent" />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {labels.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-3 rounded-lg border border-[var(--board-line)] bg-[var(--board-bg)] p-3"
              >
                {editingId === l.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 flex-1 rounded border border-[var(--board-line)] bg-[var(--board-header-bg)] px-2 text-[13px] focus:border-[#635FC7] focus:outline-none"
                      placeholder="Label name"
                    />
                    <div className="flex gap-1">
                      {LABEL_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditColor(c)}
                          className={cn(
                            "h-6 w-6 rounded-full border-2",
                            editColor === c ? "border-[var(--board-text)]" : "border-transparent"
                          )}
                          style={{ backgroundColor: c }}
                          aria-label={`Color ${c}`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdate(l.id)}
                      className="rounded bg-[#635FC7] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#A8A4FF]"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded border border-[var(--board-line)] px-3 py-1.5 text-[12px] font-medium text-[var(--board-text)]"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <LabelChip name={l.name} color={l.color} small />
                    <div className="flex-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(l.id);
                        setEditName(l.name);
                        setEditColor(l.color ?? LABEL_COLORS[0]);
                      }}
                      className="text-[12px] font-medium text-[var(--color-xanban-primary)] hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(l.id)}
                      className="rounded p-1 text-[var(--board-text-muted)] hover:bg-[#EA5555]/10 hover:text-[#EA5555]"
                      aria-label={`Delete ${l.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ))}

            {adding ? (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--board-line)] bg-[var(--board-bg)] p-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Label name"
                  className="h-8 flex-1 min-w-[120px] rounded border border-[var(--board-line)] bg-[var(--board-header-bg)] px-2 text-[13px] focus:border-[#635FC7] focus:outline-none"
                />
                <div className="flex gap-1">
                  {LABEL_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={cn(
                        "h-6 w-6 rounded-full border-2",
                        newColor === c ? "border-[var(--board-text)]" : "border-transparent"
                      )}
                      style={{ backgroundColor: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="rounded bg-[#635FC7] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#A8A4FF]"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="rounded border border-[var(--board-line)] px-3 py-1.5 text-[12px] font-medium text-[var(--board-text)]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-[#635FC7]/10 py-2.5 text-[13px] font-bold leading-[1.77] text-[#635FC7] hover:bg-[#635FC7]/20"
              >
                <Plus className="h-4 w-4" />
                Add new label
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
