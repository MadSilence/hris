"use client";

import React from "react";
import AppDataProvider from "@/components/providers/AppDataProvider/AppDataProvider";
import NavigationUtilsProvider from "@/components/providers/NavigationUtilsProvider/NavigationUtilsProvider";
import type { PublicEnvironmentConfig } from "@/config/env.types";
import QueryClientProviderWrapper from "@/components/providers/QueryClientProviderWrapper/QueryClientProviderWrapper";
import GlobalErrorProvider from "@/components/error/GlobalErrorProvider/GlobalErrorProvider";
import { TooltipProvider } from "@/components/desact/tooltip";

type AppProvidersProps = {
  env: PublicEnvironmentConfig;
  children: React.ReactNode;
};

const AppProviders: React.FC<AppProvidersProps> = ({ env, children }) => {
  return (
    <AppDataProvider env={env}>
      <QueryClientProviderWrapper>
        <GlobalErrorProvider>
          {/* One provider for every tooltip, so moving from one to the next shows it without a second delay. */}
          <TooltipProvider>
            <NavigationUtilsProvider>{children}</NavigationUtilsProvider>
          </TooltipProvider>
        </GlobalErrorProvider>
      </QueryClientProviderWrapper>
    </AppDataProvider>
  );
};

export default AppProviders;
