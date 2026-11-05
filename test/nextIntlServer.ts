/** `next-intl/server` as jest sees it — the same English translator as `test/nextIntl.tsx`, awaited. */
import type { AppLocale } from "@/i18n/locales";

import { currentTestLocale, translatorFor } from "./nextIntl";

export const getTranslations = async (namespaceOrOptions?: string | { namespace?: string }) =>
  translatorFor(typeof namespaceOrOptions === "string" ? namespaceOrOptions : namespaceOrOptions?.namespace);

export const getLocale = async (): Promise<AppLocale> => currentTestLocale();

export const getRequestConfig = <T>(factory: T): T => factory;
