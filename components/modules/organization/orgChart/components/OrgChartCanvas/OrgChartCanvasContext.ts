"use client";

import { createContext, useContext } from "react";

export type OrgChartCanvasHandlers = {
  onToggleCollapse: (id: string) => void;
  dropTargetId?: string | null;
};

const OrgChartCanvasContext = createContext<OrgChartCanvasHandlers | null>(null);

export const OrgChartCanvasProvider = OrgChartCanvasContext.Provider;

export function useOrgChartCanvas(): OrgChartCanvasHandlers {
  const ctx = useContext(OrgChartCanvasContext);
  if (!ctx) {
    throw new Error("useOrgChartCanvas must be used within an OrgChartCanvasProvider");
  }
  return ctx;
}
