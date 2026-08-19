"use client";

import React, { createContext, useContext } from "react";

import type { TeamPerson, TeamTreeNode } from "@/models/teams";

/**
 * Node components inside React Flow only receive `data`, so everything the blocks need to call
 * back into the container travels through context instead.
 */
export type TeamBlocksHandlers = {
  selectedPersonId: string | null;
  matchedPersonIds: Set<string>;
  onSelectTeam: (id: string) => void;
  onSelectPerson: (person: TeamPerson) => void;
  onToggleCollapse: (id: string) => void;
  onToggleExpanded: (id: string) => void;
  isBranchCollapsed: (id: string) => boolean;
  /** Edit mode fills these in; without them the view is read-only. */
  renderPersonChip?: (person: TeamPerson, node: TeamTreeNode) => React.ReactNode;
  renderDropZone?: (node: TeamTreeNode, children: React.ReactNode) => React.ReactNode;
};

const TeamBlocksContext = createContext<TeamBlocksHandlers | null>(null);

export const TeamBlocksProvider = TeamBlocksContext.Provider;

export function useTeamBlocks(): TeamBlocksHandlers {
  const ctx = useContext(TeamBlocksContext);
  if (!ctx) {
    throw new Error("useTeamBlocks must be used within a TeamBlocksProvider");
  }
  return ctx;
}
