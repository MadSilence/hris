"use client";

import { InternalApiClient } from "@/components/clients/apiClient";
import React, { createContext, memo, useContext, useMemo } from "react";
import { PublicEnvironmentConfig } from "@/config/env.types";

export type AppData = {
  envConfig: PublicEnvironmentConfig;
  internalApiClient: InternalApiClient;
};

export const AppDataContext = createContext<AppData>({} as AppData);

type AppDataProviderProps = {
  env: PublicEnvironmentConfig;
  children: React.ReactNode;
};

const AppDataProvider: React.FC<AppDataProviderProps> = ({ env, children }) => {
  const appData = useMemo<AppData>(() => {
    return {
      envConfig: env,
      internalApiClient: new InternalApiClient(env.environment.basePath),
    };
  }, [env]);

  return <AppDataContext.Provider value={appData}>{children}</AppDataContext.Provider>;
};

export const useAppDataContext = (): AppData => useContext(AppDataContext);

export default memo(AppDataProvider);
