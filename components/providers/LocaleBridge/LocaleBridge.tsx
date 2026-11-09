"use client";

import { useLocale, useMessages } from "next-intl";

import { setBrowserCatalogue } from "@/i18n/catalogue";
import { languageOf } from "@/i18n/locales";
import type { Messages } from "@/i18n/messages";
import { setDisplayPreferences } from "@/lib/date";
import { setErrorLocale } from "@/lib/errors/errorMessages";
import { setValidationLocale } from "@/lib/validationLocale";

/**
 * Hands the application's language to the formatters that are plain functions, not hooks — `lib/date.ts`
 * today (I18N.md § 11, step 1). The same shape as `UserSettingsProvider`, and for the same reason: a
 * date is formatted in table cells and mappers, where no hook can reach. The error texts read on the client
 * (`messageForError`) take the language the same way, and so do yup's default validation messages
 * (`lib/validationLocale.ts`).
 *
 * Set during render rather than in an effect, so the first frame of every client component already formats
 * in the right language. It is an assignment to a module variable, not React state, and the same value on
 * every render; on the server `setDisplayPreferences` does nothing.
 */
export const LocaleBridge: React.FC = () => {
  const locale = useLocale();
  setBrowserCatalogue(useMessages() as Messages);
  setDisplayPreferences({ language: languageOf(locale) });
  setErrorLocale(locale);
  setValidationLocale(locale);
  return null;
};

export default LocaleBridge;
