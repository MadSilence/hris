"use client";

import * as React from "react";

/**
 * What a page may ask of the frame the app draws around it (`app/(app)/AppShell.tsx`).
 *
 * `canvas`: a full-screen editor on a canvas (the automation editor, `design/screens/automations-editor` → Layout 1):
 * the app sidebar folds to 64 px and opens *over* the page on hover without pushing it, and the page gets the whole
 * area with no page padding. Leaving the page unfolds the sidebar again; a manual unfold while there is not
 * remembered.
 */
export type AppFrameMode = "page" | "canvas";

type AppFrameContextValue = { mode: AppFrameMode; setMode: (mode: AppFrameMode) => void };

const AppFrameContext = React.createContext<AppFrameContextValue>({ mode: "page", setMode: () => undefined });

export const AppFrameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = React.useState<AppFrameMode>("page");
  const value = React.useMemo(() => ({ mode, setMode }), [mode]);
  return <AppFrameContext.Provider value={value}>{children}</AppFrameContext.Provider>;
};

export const useAppFrameMode = (): AppFrameMode => React.useContext(AppFrameContext).mode;

/** Puts the frame into `mode` while the calling component is mounted. */
export const useAppFrame = (mode: AppFrameMode) => {
  const { setMode } = React.useContext(AppFrameContext);
  React.useEffect(() => {
    setMode(mode);
    return () => setMode("page");
  }, [mode, setMode]);
};
