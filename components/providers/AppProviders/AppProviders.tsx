"use client";

import React from "react";
import AppDataProvider from "@/components/providers/AppDataProvider/AppDataProvider";
import NavigationUtilsProvider from "@/components/providers/NavigationUtilsProvider/NavigationUtilsProvider";
import type { PublicEnvironmentConfig } from "@/config/env.types";
import QueryClientProviderWrapper from "@/components/providers/QueryClientProviderWrapper/QueryClientProviderWrapper";
import GlobalErrorProvider from "@/components/error/GlobalErrorProvider/GlobalErrorProvider";

type AppProvidersProps = {
  env: PublicEnvironmentConfig;
  children: React.ReactNode;
};

const AppProviders: React.FC<AppProvidersProps> = ({ env, children }) => {
  return (
    <AppDataProvider env={env}>
      <QueryClientProviderWrapper>
        <GlobalErrorProvider>
          <NavigationUtilsProvider>{children}</NavigationUtilsProvider>
        </GlobalErrorProvider>
      </QueryClientProviderWrapper>
    </AppDataProvider>
  );
};

export default AppProviders;
