import { Viewport } from "next";
import React from "react";
import AppDataProvider from "@/components/providers/AppDataProvider/AppDataProvider";
import getPublicEnv from "@/app/actions/getPublicEnv";
import QueryClientProviderWrapper from "@/components/providers/QueryClientProviderWrapper/QueryClientProviderWrapper";
import NavigationUtilsProvider from "@/components/providers/NavigationUtilsProvider/NavigationUtilsProvider";
import GlobalErrorProvider from "@/components/error/GlobalErrorProvider/GlobalErrorProvider";
import { helveticaNeue } from "@/styles/fonts/fonts";

type RootLayoutProps = {
  children: React.ReactNode;
};

export const rootMetadata = {
  title: "HRIS",
  description: "SixSoftware",
};

export const rootViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const RootLayout: React.FC<RootLayoutProps> = async (props) => {
  const env = await getPublicEnv();

  return (
    <html lang="en" className={helveticaNeue.variable}>
      <body>
        <AppDataProvider env={env}>
          <QueryClientProviderWrapper>
            <GlobalErrorProvider>
              <NavigationUtilsProvider>{props.children}</NavigationUtilsProvider>
            </GlobalErrorProvider>
          </QueryClientProviderWrapper>
        </AppDataProvider>
      </body>
    </html>
  );
};

export default RootLayout;
