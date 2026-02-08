"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { searchTasks, type SearchResultItem, type SearchScope } from "@/lib/search-tasks";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 1;

type SearchTasksModalProps = {
  open: boolean;
  onClose: () => void;
  boards: { id: string; name: string }[];
  selectedBoardId: string | null;
  onSelectBoard: (boardId: string) => void;
  onOpenTask: (cardId: string) => void;
};

export function SearchTasksModal({
  open,
  onClose,
  boards,
  selectedBoardId,
  onSelectBoard,
  onOpenTask,
}: SearchTasksModalProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("current");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async () => {
    if (!user?.id || query.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const items = await searchTasks(
      supabase,
      user.id,
      query,
      scope,
      selectedBoardId,
      boards.map((b) => b.id)
    );
    setResults(items);
    setLoading(false);
  }, [user?.id, query, scope, selectedBoardId, boards]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(runSearch, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [open, runSearch]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const handleResultClick = useCallback(
    (item: SearchResultItem) => {
      onSelectBoard(item.board_id);
      onOpenTask(item.id);
      onClose();
    },
    [onSelectBoard, onOpenTask, onClose]
  );

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-[var(--board-line)] bg-[var(--board-header-bg)] shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Search tasks"
      >
        <div className="flex items-center gap-2 border-b border-[var(--board-line)] p-3">
          <Search className="h-5 w-5 shrink-0 text-[var(--board-text-muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks by title or description..."
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--board-text)] placeholder:text-[var(--board-text-muted)] focus:outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[var(--board-text-muted)] hover:bg-[var(--board-bg)] hover:text-[var(--board-text)]"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 border-b border-[var(--board-line)] px-4 py-2">
          <span className="text-[12px] font-medium text-[var(--board-text-muted)]">Scope:</span>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="search-scope"
              checked={scope === "current"}
              onChange={() => setScope("current")}
              className="rounded-full border-[var(--board-line)] text-[var(--color-xanban-primary)] focus:ring-[var(--color-xanban-primary)]"
            />
            <span className="text-[13px] text-[var(--board-text)]">Current board</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="search-scope"
              checked={scope === "all"}
              onChange={() => setScope("all")}
              className="rounded-full border-[var(--board-line)] text-[var(--color-xanban-primary)] focus:ring-[var(--color-xanban-primary)]"
            />
            <span className="text-[13px] text-[var(--board-text)]">All boards</span>
          </label>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-xanban-primary)] border-t-transparent" />
            </div>
          )}
          {!loading && query.trim().length < MIN_QUERY_LENGTH && (
            <p className="py-6 text-center text-[13px] text-[var(--board-text-muted)]">
              Type at least {MIN_QUERY_LENGTH} character to search.
            </p>
          )}
          {!loading && query.trim().length >= MIN_QUERY_LENGTH && results.length === 0 && (
            <p className="py-6 text-center text-[13px] text-[var(--board-text-muted)]">
              No tasks match &quot;{query.trim()}&quot;.
            </p>
          )}
          {!loading && results.length > 0 && (
            <ul className="flex flex-col gap-1">
              {results.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleResultClick(item)}
                    className={cn(
                      "flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                      "hover:bg-[var(--board-bg)] focus:bg-[var(--board-bg)] focus:outline-none"
                    )}
                  >
                    <span className="text-[15px] font-medium text-[var(--board-text)]">
                      {item.title}
                    </span>
                    {item.description && (
                      <span className="line-clamp-2 text-[12px] text-[var(--board-text-muted)]">
                        {item.description}
                      </span>
                    )}
                    <span className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--board-text-muted)]">
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      {item.board_name}
                      {scope === "all" && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{item.column_name}</span>
                        </>
                      )}
                      {scope === "current" && item.column_name && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{item.column_name}</span>
                        </>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
