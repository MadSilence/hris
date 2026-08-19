"use client";

import { createContext, useContext } from "react";

export type DepartmentCanvasHandlers = {
  onToggleCollapse: (id: string) => void;
  /** Node currently under the dragged one and accepting it. */
  dropTargetId?: string | null;
};

const DepartmentCanvasContext = createContext<DepartmentCanvasHandlers | null>(null);

export const DepartmentCanvasProvider = DepartmentCanvasContext.Provider;

export function useDepartmentCanvas(): DepartmentCanvasHandlers {
  const ctx = useContext(DepartmentCanvasContext);
  if (!ctx) {
    throw new Error("useDepartmentCanvas must be used within a DepartmentCanvasProvider");
  }
  return ctx;
}
