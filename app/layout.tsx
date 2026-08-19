import "../public/desact/src/index.css";
import "../public/desact/src/styles/globals.css";
import React from "react";
import getPublicEnv from "@/app/actions/getPublicEnv";
import { helveticaNeue } from "@/styles/fonts/fonts";
import AppProviders from "@/components/providers/AppProviders/AppProviders";
import BrandThemeStyle from "@/components/providers/BrandThemeStyle";


type AppRootLayoutProps = {
  children: React.ReactNode;
};

const AppRootLayout: React.FC<AppRootLayoutProps> = async ({ children }) => {
  const env = await getPublicEnv();

  return (
    <html lang="en" className={helveticaNeue.variable} suppressHydrationWarning>
    <head>
      {/* Overrides the palette in globals.css, so it must render after the stylesheet import. */}
      <BrandThemeStyle/>
    </head>
    <body>
    <AppProviders env={env}>{children}</AppProviders>
    </body>
    </html>
  );
};

export default AppRootLayout;
