import "../public/desact/src/index.css";
import "../public/desact/src/styles/globals.css";
import React from "react";
import getPublicEnv from "@/app/actions/getPublicEnv";
import { helveticaNeue } from "@/styles/fonts/fonts";
import AppProviders from "@/components/providers/AppProviders/AppProviders";


type AppRootLayoutProps = {
  children: React.ReactNode;
};

const AppRootLayout: React.FC<AppRootLayoutProps> = async ({ children }) => {
  const env = await getPublicEnv();

  return (
    <html lang="en" className={helveticaNeue.variable} suppressHydrationWarning>
    <body className={helveticaNeue.className}>
    <AppProviders env={env}>{children}</AppProviders>
    </body>
    </html>
  );
};

export default AppRootLayout;
