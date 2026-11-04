import "@/styles/globals.css";
import React from "react";
import getPublicEnv from "@/app/actions/getPublicEnv";
import { fontVariables } from "@/styles/fonts/fonts";
import AppProviders from "@/components/providers/AppProviders/AppProviders";
import { workspaceAccent } from "@/components/providers/WorkspaceAccent";
import { accentAttributes } from "@/lib/theme/accent";
import type { Metadata } from "next";

/** A page names itself; the product's name follows (SPEC § 2: "Acme · noddo" inside a workspace). */
export const metadata: Metadata = {
  title: { default: "noddo", template: "%s · noddo" },
  applicationName: "noddo",
  description: "HR on templates — for teams of every size.",
};


type AppRootLayoutProps = {
  children: React.ReactNode;
};

/*
 * `data-theme` and the accent sit on <html> together (SPEC § 17). The accent is the workspace's, decided on
 * the server so the first frame already wears it; the dark theme's tokens exist but no switch is offered yet.
 */
const AppRootLayout: React.FC<AppRootLayoutProps> = async ({ children }) => {
  const env = await getPublicEnv();
  const accent = accentAttributes(await workspaceAccent());

  return (
    <html
      lang="en"
      data-theme="light"
      data-accent={accent["data-accent"]}
      style={accent.style as React.CSSProperties | undefined}
      className={fontVariables}
      suppressHydrationWarning
    >
    <body>
    <AppProviders env={env}>{children}</AppProviders>
    </body>
    </html>
  );
};

export default AppRootLayout;
