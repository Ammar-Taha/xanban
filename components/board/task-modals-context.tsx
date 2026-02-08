"use client";

import { createContext, useContext, useState } from "react";

type DeleteTaskState = { cardId: string; title: string } | null;

type TaskModalsContextType = {
  viewCardId: string | null;
  setViewCardId: (id: string | null) => void;
  editCardId: string | null;
  setEditCardId: (id: string | null) => void;
  deleteTask: DeleteTaskState;
  setDeleteTask: (v: DeleteTaskState) => void;
};

const TaskModalsContext = createContext<TaskModalsContextType | null>(null);

export function TaskModalsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [viewCardId, setViewCardId] = useState<string | null>(null);
  const [editCardId, setEditCardId] = useState<string | null>(null);
  const [deleteTask, setDeleteTask] = useState<DeleteTaskState>(null);
  return (
    <TaskModalsContext.Provider
      value={{
        viewCardId,
        setViewCardId,
        editCardId,
        setEditCardId,
        deleteTask,
        setDeleteTask,
      }}
    >
      {children}
    </TaskModalsContext.Provider>
  );
}

export function useTaskModals() {
  const ctx = useContext(TaskModalsContext);
  if (!ctx) throw new Error("useTaskModals must be used within TaskModalsProvider");
  return ctx;
}
