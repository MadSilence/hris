"use client";

import { createContext, useContext } from "react";

export type TeamCanvasHandlers = {
  onToggleCollapse: (id: string) => void;
  /** Node currently under the dragged one and accepting it. */
  dropTargetId?: string | null;
};

const TeamCanvasContext = createContext<TeamCanvasHandlers | null>(null);

export const TeamCanvasProvider = TeamCanvasContext.Provider;

export function useTeamCanvas(): TeamCanvasHandlers {
  const ctx = useContext(TeamCanvasContext);
  if (!ctx) {
    throw new Error("useTeamCanvas must be used within a TeamCanvasProvider");
  }
  return ctx;
}
