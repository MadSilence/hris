"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";

type ImpersonationContextValue = {
  isImpersonating: boolean;
  actorId?: string;
  subjectId?: string;
};

const ImpersonationContext = createContext<ImpersonationContextValue | null>(null);

const ImpersonationProvider = ({ children }: { children: React.ReactNode }) => {
  const { impersonating, actorId, subjectId } = useCurrentUser();

  const value = useMemo(
    () => ({
      isImpersonating: impersonating,
      actorId,
      subjectId,
    }),
    [impersonating, actorId, subjectId]
  );

  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  );
};

export function useImpersonationContext() {
  const context = useContext(ImpersonationContext);

  if (!context) {
    throw new Error("useImpersonationContext must be used inside ImpersonationProvider");
  }

  return context;
}

export default ImpersonationProvider;
