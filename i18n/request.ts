import { getRequestConfig } from "next-intl/server";

import { messagesFor } from "./messages";
import { resolveLocale } from "./resolveLocale";

/**
 * `next-intl`'s per-request configuration (`next.config.ts` points the plugin here). No locale in the URL
 * (I18N_DESIGN.md § 3): the locale is the person's, resolved by `resolveLocale`.
 *
 * `timeZone` is fixed and unused on purpose: dates are never formatted through a message — every displayed
 * date goes through `lib/date.ts`, which applies the reader's zone (DECISIONS.md § "Dates are formatted in one
 * place"). It is set only so `next-intl` does not warn about an environment fallback.
 */
export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  return {
    locale,
    messages: messagesFor(locale),
    timeZone: "UTC",
  };
});
