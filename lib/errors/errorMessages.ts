import { createTranslator } from "next-intl";

import { ApiError } from "@/components/clients/exceptions";
import { type AppLocale, DEFAULT_LOCALE, LOCALES } from "@/i18n/locales";
import { catalogueFor } from "@/i18n/catalogue";
import enErrors from "@/messages/en/errors.json";

/**
 * What a person reads when something is refused.
 *
 * The key is the backend's error code, not its message: `message` is technical English written for
 * a developer and a log ("Document folder name not changed") and is never rendered. The words live in the
 * `errors` catalogue — `messages/<locale>/errors.json` (technical_documentation/I18N.md § 6.4) — which is the
 * only place a user-facing string for an error exists, in every language.
 *
 * The catalogue will always lag behind the backend: someone adds a code in Java and forgets the
 * entry. That is expected, not a fault — see `messageForCode` for what happens then.
 *
 * Adding an error: `technical_documentation/ERRORS.md` — the English text goes into
 * `messages/en/errors.json`, keyed by the code; `{0}`, `{1}` … are the backend's `params`, in order.
 */
export const ERROR_MESSAGES: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(enErrors).filter(([code]) => code !== "fallback"),
);

/**
 * Codes whose message still comes from the backend.
 *
 * **This set used to hold 46 entries and is now empty on purpose.** Those codes carry values in their
 * text ("Unknown attribute: {0}"), the parameters were not sent separately, and so a fixed entry here
 * would have dropped the one part that said *which* attribute — the dictionary could not own them.
 *
 * The backend sends `params` alongside `code` and `message` now, and {@link messageForCode}
 * interpolates them into our own wording, so every one of those codes has a real entry above.
 *
 * Keep the set: it is the honest escape hatch for the next code whose message carries data before
 * anyone has written a user-facing version. An entry here is debt with a name, which is better than
 * a developer's sentence reaching a person with no record that it did.
 */
export const SERVER_TEXT_CODES = new Set<string>([]);

/**
 * The language error texts are written in when the caller does not say — the reader's, in the browser.
 *
 * `LocaleBridge` sets it on the client. On the server it is never set (a module variable there would be one
 * request's language leaking into the next): a server action passes its request's locale explicitly
 * (`toActionError`).
 */
let clientLocale: AppLocale = DEFAULT_LOCALE;

export const setErrorLocale = (locale: AppLocale): void => {
  if (typeof window === "undefined") return;
  clientLocale = locale;
};

const translators = new Map<AppLocale, ReturnType<typeof translatorFor>>();

function translatorFor(locale: AppLocale) {
  return createTranslator({
    locale,
    messages: catalogueFor(locale),
    namespace: "errors",
    // A missing parameter is not an exception here: the text below is built by hand instead.
    onError: () => {},
  });
}

const errorsIn = (locale: AppLocale): Record<string, string> =>
  catalogueFor(locale).errors as unknown as Record<string, string>;

/** Shown when the code has no entry and the server sent nothing usable — in the reader's language. */
export const fallbackErrorMessage = (locale: AppLocale = clientLocale): string => errorsIn(locale).fallback;

/**
 * Whether a text is the generic sentence, in any language. The cards and inline errors print a reference
 * only for that one — a refused business rule has nothing to look up.
 */
export const isFallbackErrorMessage = (message: string | null | undefined): boolean =>
  !!message && LOCALES.some((locale) => errorsIn(locale).fallback === message);

/** Whether the catalogue has words of its own for this code. */
export const hasMessageForCode = (code?: string): code is string =>
  !!code && code !== "fallback" && Object.prototype.hasOwnProperty.call(enErrors, code);

/**
 * The user-facing text for a failure.
 *
 * Order matters: the catalogue wins, then the server's own words for the parameterised codes, then
 * the generic sentence. The code itself is not appended here — the card and the inline error render
 * it separately, in small type, so support has something to match on.
 */
export const messageForCode = (
  code?: string,
  serverMessage?: string,
  params?: string[],
  locale: AppLocale = clientLocale,
): string => {
  if (hasMessageForCode(code)) return format(locale, code, params);
  if (code && SERVER_TEXT_CODES.has(code) && serverMessage) return serverMessage;
  return fallbackErrorMessage(locale);
};

/**
 * Fills `{0}`, `{1}` … from the values the backend sent, through ICU — so a translation may use them in
 * a plural or put them in another order.
 *
 * A placeholder with no value is left as it is rather than blanked: "must be at least {1}" reads as
 * unfinished, which it is, while "must be at least " reads as a sentence somebody wrote badly. The
 * first is a bug report, the second is a mystery.
 */
const format = (locale: AppLocale, code: string, params?: string[]): string => {
  const template = errorsIn(locale)[code];
  // The backend sends every parameter as a string, and an ICU plural needs a number. Only a plural's: a plain
  // `{0}` given a number would be formatted, and a year would read "2,026".
  const plurals = new Set([...template.matchAll(/\{(\d+),\s*plural/g)].map((match) => Number(match[1])));
  const values = Object.fromEntries((params ?? []).map((value, index) =>
    [String(index), plurals.has(index) && /^-?\d+$/.test(value) ? Number(value) : value]));
  const wanted = [...template.matchAll(/\{(\d+)[,}]/g)].map((match) => Number(match[1]));
  if (wanted.every((index) => params?.[index] !== undefined)) {
    let translator = translators.get(locale);
    if (!translator) {
      translator = translatorFor(locale);
      translators.set(locale, translator);
    }
    return (translator as unknown as (key: string, values: Record<string, string | number>) => string)(code, values);
  }
  return template.replace(/\{(\d+)\}/g, (whole, index) => params?.[Number(index)] ?? whole);
};

/**
 * The same decision, straight from a caught error.
 *
 * Two kinds of error arrive here and they need opposite treatment:
 *
 * - an `ApiError` still carries the backend's technical wording, so the code decides the text;
 * - anything else on the client has almost always come back through a mutation hook, which throws
 *   `new Error(result.errorMessage)` — and that message was *already* resolved by `toActionError`.
 *   Sending it through the dictionary again would find no code and replace good text with the
 *   generic sentence. That is exactly what happened in the first smoke run: the reason travelled
 *   all the way from Java and was thrown away at the last step.
 *
 * The remaining gap is that a plain `Error` loses `code` and `requestId` on the way through the
 * hook, so a card built from one cannot show a reference. Fixing that means the hooks carrying the
 * envelope instead of flattening it — recorded in TECH_DEBT.md.
 */
export const messageForError = (error: unknown): string => {
  if (error instanceof ApiError) return messageForCode(error.code, error.message, error.params);
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallbackErrorMessage();
};
