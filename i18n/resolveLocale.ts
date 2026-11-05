import * as React from "react";
import { cookies, headers } from "next/headers";

import { hrisFirstRunService } from "@/api/modules/firstRun/services";
import { currentCompanySubdomain, publicAppearanceFor } from "@/api/modules/companyAddress";
import { ACCESS_COOKIE } from "@/config/security/sessionCookieNames";

import {
  type AppLocale,
  DEFAULT_LOCALE,
  negotiateLanguage,
  PSEUDO_LOCALE,
  PSEUDO_LOCALE_COOKIE,
  toLanguage,
} from "./locales";

/** React's per-request memoisation where the App Router has it; plain calls under jest (see `currentCompanyAddress`). */
const cache: <F extends (...args: never[]) => unknown>(fn: F) => F =
  (React as { cache?: <F>(fn: F) => F }).cache ?? ((fn) => fn);

/**
 * Which language this response is written in — `technical_documentation/I18N.md` § 5.
 *
 * In order: the person's own choice, the company's language, and — only where nobody is signed in — the
 * company the address belongs to, then the browser's `Accept-Language`; English last. One read per request,
 * shared by the layout, the page and `next-intl`'s request config, so a page cannot be half in one language.
 *
 * **Fails to English, silently.** A language is never worth an error screen: a backend that does not answer
 * gives the default, exactly as `workspaceAccent` gives the default colour.
 */
export const resolveLocale = cache(async (): Promise<AppLocale> => {
  const cookieStore = await cookies();

  if (process.env.NODE_ENV !== "production" && cookieStore.get(PSEUDO_LOCALE_COOKIE)?.value === "1") {
    return PSEUDO_LOCALE;
  }

  if (cookieStore.get(ACCESS_COOKIE)?.value) {
    try {
      const settings = await hrisFirstRunService.getUserSettings();
      return toLanguage(settings.language) ?? toLanguage(settings.companyLanguage) ?? DEFAULT_LOCALE;
    } catch {
      // A session the backend refused: answer as if nobody were signed in.
    }
  }

  const subdomain = await currentCompanySubdomain();
  if (subdomain) {
    const company = toLanguage((await publicAppearanceFor(subdomain)).language);
    if (company) return company;
  }

  return negotiateLanguage((await headers()).get("accept-language")) ?? DEFAULT_LOCALE;
});
