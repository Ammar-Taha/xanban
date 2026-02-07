import { create } from "zustand";
import { persist } from "zustand/middleware";

type BoardUIState = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  addBoardModalOpen: boolean;
  setAddBoardModalOpen: (open: boolean) => void;
};

export const useBoardUIStore = create<BoardUIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      addBoardModalOpen: false,
      setAddBoardModalOpen: (open) => set({ addBoardModalOpen: open }),
    }),
    {
      name: "xanban-board-ui",
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
    }
  )
);
