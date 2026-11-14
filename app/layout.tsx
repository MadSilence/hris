import "@/styles/globals.css";
import React from "react";
import getPublicEnv from "@/app/actions/getPublicEnv";
import { fontVariables } from "@/styles/fonts/fonts";
import AppProviders from "@/components/providers/AppProviders/AppProviders";
import { workspaceAccent } from "@/components/providers/WorkspaceAccent";
import { accentAttributes } from "@/lib/theme/accent";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { LocaleBridge } from "@/components/providers/LocaleBridge";

/** A page names itself; the product's name follows (SPEC § 2: "Acme · noddo" inside a workspace). */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("navigation");
  return {
    title: { default: "noddo", template: "%s · noddo" },
    applicationName: "noddo",
    description: t("meta.description"),
  };
}


type AppRootLayoutProps = {
  children: React.ReactNode;
};

/*
 * `data-theme` and the accent sit on <html> together (SPEC § 17). The accent is the workspace's, decided on
 * the server so the first frame already wears it; the dark theme's tokens exist but no switch is offered yet.
 */
const AppRootLayout: React.FC<AppRootLayoutProps> = async ({ children }) => {
  // `locale`: the reader's language (I18N.md § 5) — `lang` tells the browser and assistive tech what it is reading.
  const [env, workspace, locale] = await Promise.all([getPublicEnv(), workspaceAccent(), getLocale()]);
  const accent = accentAttributes(workspace);

  return (
    <html
      lang={locale}
      data-theme="light"
      data-accent={accent["data-accent"]}
      data-accent-tone={accent["data-accent-tone"]}
      style={accent.style as React.CSSProperties | undefined}
      className={fontVariables}
      suppressHydrationWarning
    >
    <body>
    {/* Inherits the locale and the catalogue from `i18n/request.ts`. */}
    <NextIntlClientProvider>
      <LocaleBridge/>
      <AppProviders env={env}>{children}</AppProviders>
    </NextIntlClientProvider>
    </body>
    </html>
  );
};

export default AppRootLayout;
