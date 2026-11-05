import en from "@/messages/en";
import ru from "@/messages/ru";

import { type AppLocale, PSEUDO_LOCALE } from "./locales";
import { pseudoCatalogue } from "./pseudo";

/** Every key of the application — the English catalogue's shape (`global.d.ts` types `t()` with it). */
export type Messages = typeof en;

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

/**
 * English underneath, the translation on top: a key the translation lacks is read in English, never shown
 * as its raw name (I18N.md § 2, rule 5). The catalogue test reports what a translation lacks.
 */
const overlay = <T>(base: T, top: DeepPartial<T> | undefined): T => {
  if (top === undefined) return base;
  if (typeof base !== "object" || base === null) return (top as T) ?? base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(top as Record<string, unknown>)) {
    if (value === undefined) continue;
    out[key] = overlay((base as Record<string, unknown>)[key], value as DeepPartial<unknown>);
  }
  return out as T;
};

let pseudo: Messages | null = null;
const russian = overlay(en, ru);

/** The whole catalogue for a locale, complete — the missing keys of a translation filled from English. */
export const messagesFor = (locale: AppLocale): Messages => {
  switch (locale) {
    case "ru":
      return russian;
    case PSEUDO_LOCALE:
      pseudo ??= pseudoCatalogue(en);
      return pseudo;
    default:
      return en;
  }
};
