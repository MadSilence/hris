"use client";

import React, { createContext, useContext } from "react";

import type { DepartmentPerson, DepartmentTreeNode } from "@/models/departments";

/**
 * Node components inside React Flow only receive `data`, so everything the blocks need to call
 * back into the container travels through context instead.
 */
export type DepartmentBlocksHandlers = {
  selectedPersonId: string | null;
  matchedPersonIds: Set<string>;
  onSelectDepartment: (id: string) => void;
  onSelectPerson: (person: DepartmentPerson) => void;
  onToggleCollapse: (id: string) => void;
  onToggleExpanded: (id: string) => void;
  isBranchCollapsed: (id: string) => boolean;
  /** Edit mode fills these in; without them the view is read-only. */
  renderPersonChip?: (person: DepartmentPerson, node: DepartmentTreeNode) => React.ReactNode;
  renderDropZone?: (node: DepartmentTreeNode, children: React.ReactNode) => React.ReactNode;
};

const DepartmentBlocksContext = createContext<DepartmentBlocksHandlers | null>(null);

export const DepartmentBlocksProvider = DepartmentBlocksContext.Provider;

export function useDepartmentBlocks(): DepartmentBlocksHandlers {
  const ctx = useContext(DepartmentBlocksContext);
  if (!ctx) {
    throw new Error("useDepartmentBlocks must be used within a DepartmentBlocksProvider");
  }
  return ctx;
}
