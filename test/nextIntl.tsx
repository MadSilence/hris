/**
 * `next-intl` as jest sees it (mapped in `jest.config.ts`).
 *
 * Components are tested in English through the **real** ICU formatter and the real catalogue — a key that is
 * missing, a broken plural or a forgotten argument fails the test exactly as it would fail the page — but
 * without a provider: a component under test does not have to be wrapped, so the ~320 existing tests keep
 * asserting the English text they always asserted.
 *
 * A test that wants another language wraps its render in `withTestLocale("ru", () => …)`.
 */
import * as React from "react";
import { createTranslator } from "use-intl/core";

import type { AppLocale } from "@/i18n/locales";
import { messagesFor } from "@/i18n/messages";

let currentLocale: AppLocale = "en";

export const withTestLocale = <T,>(locale: AppLocale, run: () => T): T => {
  const before = currentLocale;
  currentLocale = locale;
  try {
    return run();
  } finally {
    currentLocale = before;
  }
};

/**
 * One translator per locale and namespace, like `next-intl`'s own memoised `t`: a new function on every
 * render would re-run every effect and memo that lists `t` as a dependency, which production never does.
 */
const translators = new Map<string, ReturnType<typeof createTranslator>>();

export const translatorFor = (namespace?: string) => {
  const key = `${currentLocale}|${namespace ?? ""}`;
  let translator = translators.get(key);
  if (!translator) {
    translator = createTranslator({
      locale: currentLocale,
      messages: messagesFor(currentLocale),
      namespace: namespace as never,
      timeZone: "UTC",
    });
    translators.set(key, translator);
  }
  return translator;
};

export const useTranslations = (namespace?: string) => translatorFor(namespace);

export const currentTestLocale = (): AppLocale => currentLocale;

export const useLocale = (): AppLocale => currentLocale;

export const useMessages = () => messagesFor(currentLocale);

export const NextIntlClientProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;

export { createTranslator };
