import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BoardSummary = { id: string; name: string };

type BoardUIState = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  addBoardModalOpen: boolean;
  setAddBoardModalOpen: (open: boolean) => void;
  addTaskModalOpen: boolean;
  setAddTaskModalOpen: (open: boolean) => void;
  addColumnModalOpen: boolean;
  setAddColumnModalOpen: (open: boolean) => void;
  editBoardModalOpen: boolean;
  setEditBoardModalOpen: (open: boolean) => void;
  deleteBoardModalOpen: boolean;
  setDeleteBoardModalOpen: (open: boolean) => void;
  manageLabelsModalOpen: boolean;
  setManageLabelsModalOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
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
      addTaskModalOpen: false,
      setAddTaskModalOpen: (open) => set({ addTaskModalOpen: open }),
      addColumnModalOpen: false,
      setAddColumnModalOpen: (open) => set({ addColumnModalOpen: open }),
      editBoardModalOpen: false,
      setEditBoardModalOpen: (open) => set({ editBoardModalOpen: open }),
      deleteBoardModalOpen: false,
      setDeleteBoardModalOpen: (open) => set({ deleteBoardModalOpen: open }),
      manageLabelsModalOpen: false,
      setManageLabelsModalOpen: (open) => set({ manageLabelsModalOpen: open }),
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      selectedBoardId: null,
      setSelectedBoardId: (id) => set({ selectedBoardId: id }),
    }),
    {
      name: "xanban-board-ui",
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen, selectedBoardId: state.selectedBoardId }),
    }
  )
);
