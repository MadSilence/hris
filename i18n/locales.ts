/**
 * The languages the application speaks — `technical_design/I18N_DESIGN.md`.
 *
 * One list for the whole frontend: the catalogues under `messages/<locale>/`, the resolution in
 * `resolveLocale`, the company's Language field. The backend's `AppLanguage` enum lists the same codes and
 * the database refuses any other (`chk_company_settings_language`).
 *
 * English is the source: every key exists there first, and any key a translation lacks is read from it.
 */
export const LOCALES = ["en", "ru"] as const;

export type Language = (typeof LOCALES)[number];

/**
 * The pseudo-locale (§ 7.4): English with every letter accented and every message lengthened, generated
 * from the English catalogue. Development only — it shows, in one walk, every string that never reached a
 * catalogue and every layout that breaks on a longer language. Never stored, never offered to a company.
 */
export const PSEUDO_LOCALE = "en-XA" as const;

export type AppLocale = Language | typeof PSEUDO_LOCALE;

export const DEFAULT_LOCALE: Language = "en";

/** The cookie that turns the pseudo-locale on, outside production only (`document.cookie = "hris_pseudo_locale=1"`). */
export const PSEUDO_LOCALE_COOKIE = "hris_pseudo_locale";

export const isLanguage = (value: unknown): value is Language =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

/** A stored or sent code as one of ours, or null — `" RU "` is Russian, `"de"` is nothing we speak. */
export const toLanguage = (raw: string | null | undefined): Language | null => {
  const code = raw?.trim().toLowerCase();
  return isLanguage(code) ? code : null;
};

/**
 * The first language of an `Accept-Language` header we have catalogues for. Used only before anybody signs
 * in on the root, where there is no company to ask. Quality values are respected; regions are ignored
 * (`ru-RU` is Russian).
 */
export const negotiateLanguage = (header: string | null | undefined): Language | null => {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.slice(2)) : 1, index };
    })
    .filter((entry) => entry.tag && !Number.isNaN(entry.q) && entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);

  for (const { tag } of ranked) {
    const language = toLanguage(tag.split("-")[0]);
    if (language) return language;
  }
  return null;
};

/** The language a locale's words are in — the pseudo-locale is English underneath. */
export const languageOf = (locale: AppLocale): Language => (locale === PSEUDO_LOCALE ? "en" : locale);
