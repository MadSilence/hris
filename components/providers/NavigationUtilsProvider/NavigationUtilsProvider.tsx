"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type NavigationUtils = {
  shouldConfirmNavigation: boolean;
  setShouldConfirmNavigation: React.Dispatch<React.SetStateAction<boolean>>;
};

export const NavigationUtilsContext = createContext<NavigationUtils>({} as NavigationUtils);

type NavigationUtilsProviderProps = {
  children: React.ReactNode;
};

const NavigationUtilsProvider: React.FC<NavigationUtilsProviderProps> = ({ children }) => {
  const [shouldConfirmNavigation, setShouldConfirmNavigation] = useState(false);

  useEffect(() => {
    if (!shouldConfirmNavigation) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [shouldConfirmNavigation]);

  const value = useMemo(
    () => ({ shouldConfirmNavigation, setShouldConfirmNavigation }),
    [shouldConfirmNavigation],
  );

  return (
    <NavigationUtilsContext.Provider value={value}>{children}</NavigationUtilsContext.Provider>
  );
};

export const useNavigationUtilsContext = (): NavigationUtils => useContext(NavigationUtilsContext);
export const useShouldConfirmNavigation = () =>
  useContext(NavigationUtilsContext).setShouldConfirmNavigation;

export default NavigationUtilsProvider;
