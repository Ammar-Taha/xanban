import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BoardSummary = { id: string; name: string };

type BoardUIState = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  addBoardModalOpen: boolean;
  setAddBoardModalOpen: (open: boolean) => void;
  selectedBoardId: string | null;
  setSelectedBoardId: (id: string | null) => void;
};

export const useBoardUIStore = create<BoardUIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      addBoardModalOpen: false,
      setAddBoardModalOpen: (open) => set({ addBoardModalOpen: open }),
      selectedBoardId: null,
      setSelectedBoardId: (id) => set({ selectedBoardId: id }),
    }),
    {
      name: "xanban-board-ui",
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen, selectedBoardId: state.selectedBoardId }),
    }
  )
);
