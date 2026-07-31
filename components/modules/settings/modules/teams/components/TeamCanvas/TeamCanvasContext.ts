"use client";

import { createContext, useContext } from "react";

export type TeamCanvasHandlers = {
  onToggleCollapse: (id: string) => void;
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
