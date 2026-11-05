"use client";

import * as React from "react";
import "@/styles/globals.css";
import { fontVariables } from "@/styles/fonts/fonts";
import Link from "next/link";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { ErrorPage } from "@/components/feedback/ErrorPage";
import { DEFAULT_LOCALE, type Language, toLanguage } from "@/i18n/locales";
import commonEn from "@/messages/en/common.json";
import navigationEn from "@/messages/en/navigation.json";
import commonRu from "@/messages/ru/common.json";
import navigationRu from "@/messages/ru/navigation.json";

/**
 * Only the two namespaces this page reads, for both languages — the root layout, which provides the whole
 * catalogue, is the thing that failed.
 */
const MESSAGES = {
  en: { common: commonEn, navigation: navigationEn },
  ru: { common: commonRu, navigation: navigationRu },
} as const;

/** The language the failed document was in, else the browser's; English when neither is one we speak. */
const readLanguage = (): Language => {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  return (
    toLanguage(document.documentElement.lang?.split("-")[0]) ??
    toLanguage(navigator.language?.split("-")[0]) ??
    DEFAULT_LOCALE
  );
};

/**
 * The last net: an error thrown in the root layout itself, where `app/(app)/error.tsx` cannot reach. Next.js
 * renders this instead of the whole document, so it brings its own `<html>` and stylesheet — and no workspace
 * accent, which the root layout would have read: the default noddo accent is what the person sees.
 *
 * It renders outside the root layout's `NextIntlClientProvider`, so it brings its own, too.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    console.error("Unhandled error in the root layout:", error, error.digest ?? "");
  }, [error]);

  const [language] = React.useState(readLanguage);

  return (
    <html lang={language} data-theme="light" className={fontVariables}>
      <body>
        <NextIntlClientProvider locale={language} messages={MESSAGES[language] as never} timeZone="UTC">
          <GlobalErrorPage digest={error.digest} reset={reset} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

function GlobalErrorPage({ digest, reset }: { digest?: string; reset: () => void }) {
  const t = useTranslations("navigation");
  const tCommon = useTranslations("common");
  return (
    <ErrorPage
      fullScreen
      scene="something-broke"
      title={t("errorPages.serverTitle")}
      line={t("errorPages.serverLine")}
      reference={digest}
      actions={
        <>
          <Button type="button" onClick={reset}>
            {tCommon("actions.retry")}
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">{tCommon("actions.goHome")}</Link>
          </Button>
        </>
      }
    />
  );
}
