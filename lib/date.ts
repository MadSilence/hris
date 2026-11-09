import { useLocale } from "next-intl";

import { languageOf } from "@/i18n/locales";

/**
 * Conversion between a `Date` and a `yyyy-MM-dd` string, the form a date takes over the API.
 *
 * Both directions work in **local** time, on purpose: `new Date("2026-01-01")` parses as UTC
 * midnight and `toISOString()` converts back to UTC, so in any zone west of Greenwich the date
 * shifts by a day. That is why a date is assembled and taken apart by its components.
 */
export const pad = (n: number) => String(n).padStart(2, "0");

/** `Date` → `yyyy-MM-dd`, from local components, with no shift through UTC. */
export const dateToISO = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** `yyyy-MM-dd` → local midnight. */
export const isoToDate = (iso: string): Date => new Date(`${iso}T00:00:00`);

/** `yyyy-MM-dd` from separate numbers (the month as in `Date`, zero-based). */
export const partsToISO = (year: number, monthIndex: number, day: number): string =>
  `${year}-${pad(monthIndex + 1)}-${pad(day)}`;

/**
 * How the person reading this page wants dates written, and in whose zone.
 *
 * <p>A module-level value rather than a hook, because `formatDisplayDate` is called from table cells,
 * mappers and plain functions — threading a context through sixty call sites to change a format is
 * how the locale ended up hard-coded inside components in the first place.
 *
 * <p><b>Only ever set in the browser.</b> On the server this module is shared by every request, so a
 * preference written here would be one reader's settings applied to the next reader's page. The
 * server keeps the defaults, which is exactly what every date did before anybody could choose.
 */
export type DisplayDateFormat = "SYSTEM" | "DMY" | "MDY" | "YMD";

type DisplayPreferences = {
  /** IANA zone, or null to use the browser's — which is what it always was. */
  timeZone: string | null;
  dateFormat: DisplayDateFormat;
  /**
   * The language the application speaks (`i18n/locales`), set by `LocaleBridge`; null until it is, which is
   * the browser's own locale — what every date did before there was a language. It decides the *words* of a
   * date (a month's name), never its order: the order is `dateFormat`'s (I18N.md § 2, rule 6).
   */
  language: string | null;
};

const DEFAULT_PREFERENCES: DisplayPreferences = { timeZone: null, dateFormat: "SYSTEM", language: null };

let preferences: DisplayPreferences = DEFAULT_PREFERENCES;

/** Applied by `UserSettingsProvider` once the signed-in person's settings arrive. */
export const setDisplayPreferences = (next: Partial<DisplayPreferences>): void => {
  if (typeof window === "undefined") return;
  preferences = { ...DEFAULT_PREFERENCES, ...preferences, ...next };
};

/** For tests, and for signing out. */
export const resetDisplayPreferences = (): void => {
  preferences = DEFAULT_PREFERENCES;
};

/**
 * The locale each explicit format is expressed in.
 *
 * <p>Used only for the `medium` style, where the month is a word and hand-assembling the string
 * would mean shipping a month-name table. The numeric style is built from the parts instead, because
 * `en-GB` writes 12/03/2026 and the answer somebody chose "day first" expects is 12.03.2026.
 */
const LOCALE_FOR: Record<Exclude<DisplayDateFormat, "SYSTEM">, string> = {
  DMY: "en-GB",
  MDY: "en-US",
  YMD: "sv-SE",
};

/**
 * The locale "the system's format" means once the application has a language: the browser's own when it
 * speaks the same language (an `en-GB` browser keeps 12/03/2026 in English), otherwise the application's —
 * a Russian page in an `en-US` browser writes Russian month names. Null before the language is known.
 */
/**
 * The application's language: what `LocaleBridge` set, or — before it has run — the page's own `<html lang>`,
 * which the server wrote before any script. Hydration does not render the tree in document order, so a
 * component can format a date before the bridge has; reading the attribute makes the order irrelevant
 * (found on the i18n walk: a Russian profile showed a Russian sentence with an English date).
 */
const appLanguage = (explicit?: string): string | null => {
  if (explicit) return explicit.toLowerCase().split("-")[0];
  if (preferences.language) return preferences.language;
  if (typeof document === "undefined") return null;
  const lang = document.documentElement.lang?.toLowerCase().split("-")[0];
  return lang || null;
};

const systemLocale = (explicit?: string): string | undefined => {
  const language = appLanguage(explicit);
  if (!language) return undefined;
  const browser = typeof navigator === "undefined" ? [] : navigator.languages ?? [navigator.language];
  return browser.find((tag) => tag?.toLowerCase().split("-")[0] === language) ?? language;
};

/**
 * The locale numbers, money and names are written in — {@link systemLocale}, exported for the formatters that
 * live outside this file (`Intl.NumberFormat`, `Intl.DisplayNames`, `toLocaleString`). No component may name a
 * locale of its own (DECISIONS.md § "Dates are formatted in one place"); it asks here. Undefined before the
 * language is known, which is the browser's own — what every one of them did before.
 *
 * <p>Pass `language` wherever the caller knows it — always during render (`useDisplayLocale()`), because on the
 * server neither `LocaleBridge` nor `<html lang>` exists and the fallback is Node's own English.
 */
export const displayLocale = (language?: string): string | undefined => systemLocale(language);

/** The locale a chosen format's month names are written in: English's regional twin, or the language itself. */
const wordsLocale = (chosen: Exclude<DisplayDateFormat, "SYSTEM">, explicit?: string): string => {
  const language = appLanguage(explicit);
  return language && language !== "en" ? language : LOCALE_FOR[chosen];
};

export type DisplayDateOptions = {
  hideYear?: boolean;
  locale?: string;
  style?: "numeric" | "medium";
  language?: string;
};

export type DateFormatter = (value: string | Date | null | undefined, options?: DisplayDateOptions) => string;

/**
 * A date as a person reads it.
 *
 * **The one place a display format is chosen.** No component may name a locale of its own: a locale
 * inside a component is a setting stored where nobody can find or change it, which is how `ru-RU`
 * came to ship in an English-only product. See `DECISIONS.md` § "Dates are formatted in one place,
 * and no component holds a locale".
 *
 * Where the format comes from, in order: what the caller passed, what the reader chose, and
 * otherwise the browser's own — which is the behaviour every date had before the setting existed.
 *
 * **A calendar date carries no zone and is never moved by one.** `2026-03-12` is the twelfth of March
 * to everybody; only an instant — a `createdAt`, a notification's timestamp — is read in somebody's
 * zone, and that is the question `analysis/DATES_NUMBERS_TZ_ANALYSIS.md` § 4 asked.
 *
 * `hideYear` serves the attribute option of the same name (birthdays, anniversaries). `style` keeps
 * the two shapes the product already uses — `numeric` (12.03.2026) in dense tables and profile rows,
 * `medium` (12 Mar 2026) where a date is read rather than scanned.
 *
 * `language` is the application's language (`"ru"`). **Pass it during render** — through
 * {@link useDateFormatter} in a client component, `languageOf(await getLocale())` in a server one: on the server
 * there is no `LocaleBridge` and no `<html lang>` to fall back on, and a module variable there would be shared
 * by every request. Without it the language comes from those two, which is right only for code that runs in
 * the browser outside React (an event handler, an export built on click).
 */
export const formatDisplayDate: DateFormatter = (value, options) => {
  if (value == null || value === "") return "";

  // A bare `yyyy-MM-dd` is a calendar date, not an instant: parsing it through `new Date` reads it
  // as midnight UTC and shows the previous day to anyone west of Greenwich.
  const isCalendarDate = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
  const date = isCalendarDate ? isoToDate((value as string).trim()) : new Date(value);

  if (Number.isNaN(date.getTime())) return typeof value === "string" ? value : "";

  const zone = isCalendarDate ? undefined : preferences.timeZone ?? undefined;
  const chosen = preferences.dateFormat;

  // An explicit locale from the caller still wins: it is the escape hatch for a screen that has a
  // reason, and there is exactly one such caller today.
  if (options?.locale || chosen === "SYSTEM") {
    return new Intl.DateTimeFormat(options?.locale ?? systemLocale(options?.language), {
      day: "2-digit",
      month: options?.style === "medium" ? "short" : "2-digit",
      ...(options?.hideYear ? {} : { year: "numeric" }),
      ...(zone ? { timeZone: zone } : {}),
    }).format(date);
  }

  if (options?.style === "medium") {
    return new Intl.DateTimeFormat(wordsLocale(chosen, options?.language), {
      day: "2-digit",
      month: "short",
      ...(options?.hideYear ? {} : { year: "numeric" }),
      ...(zone ? { timeZone: zone } : {}),
    }).format(date);
  }

  const parts = numericParts(date, zone);
  return numericPattern(chosen, parts, options?.hideYear === true);
};

/** One bound formatter per language, so the hook hands back the same function on every render. */
const boundFormatters = new Map<string, DateFormatter>();

/** {@link formatDisplayDate} bound to a language — for a helper that is handed one instead of a hook. */
export const dateFormatterFor = (language: string): DateFormatter => {
  let bound = boundFormatters.get(language);
  if (!bound) {
    bound = (value, options) => formatDisplayDate(value, { ...options, language: options?.language ?? language });
    boundFormatters.set(language, bound);
  }
  return bound;
};

/**
 * {@link formatDisplayDate} in the page's language — what every component formats a date with during render.
 * The language comes from `next-intl`'s `useLocale`, which the server knows per request, so the HTML the
 * server writes is already in the reader's language (a Russian page no longer says "Nov 12, 2026"). The
 * function is stable for a language, safe in a dependency list.
 */
export const useDateFormatter = (): DateFormatter => dateFormatterFor(languageOf(useLocale()));

/** The page's language as a code, for {@link displayLocale} and for helpers that take one. */
export const useDisplayLanguage = (): string => languageOf(useLocale());

/** {@link displayLocale} in the page's language — for `Intl.NumberFormat` and friends during render. */
export const useDisplayLocale = (): string | undefined => displayLocale(useDisplayLanguage());

/** Day, month and year as the reader's zone sees them — the pieces the numeric styles assemble. */
const numericParts = (date: Date, zone: string | undefined): { day: string; month: string; year: string } => {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(zone ? { timeZone: zone } : {}),
  }).formatToParts(date);

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    formatted.find((p) => p.type === type)?.value ?? "";

  return { day: part("day"), month: part("month"), year: part("year") };
};

const numericPattern = (
  format: Exclude<DisplayDateFormat, "SYSTEM">,
  { day, month, year }: { day: string; month: string; year: string },
  hideYear: boolean,
): string => {
  switch (format) {
    case "DMY":
      return hideYear ? `${day}.${month}` : `${day}.${month}.${year}`;
    case "MDY":
      return hideYear ? `${month}/${day}` : `${month}/${day}/${year}`;
    case "YMD":
      return hideYear ? `${month}-${day}` : `${year}-${month}-${day}`;
  }
};

/**
 * The short style (the owner, 2026-11-05, C1): what a person reads in a panel or a dialog — "Wed, 11 Nov",
 * "Wed–Fri, 11–13 Nov", or "Nov 11–13" for a reader whose order is month first. **No year for the current year**;
 * the year appears for a date in another year, and on both ends of a range that crosses one. The order of day and
 * month is the reader's (`dateFormat`; for "the system's", the locale's own), the words are the page's language.
 */
export type ShortDateOptions = { weekday?: boolean; language?: string; today?: Date };

/** Day before month, or month before day, as the reader writes dates. */
const dayFirst = (language?: string): boolean => {
  const chosen = preferences.dateFormat;
  if (chosen === "MDY") return false;
  if (chosen === "DMY" || chosen === "YMD") return true;
  const locale = systemLocale(language) ?? "en-GB";
  const parts = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).formatToParts(new Date(2026, 10, 11));
  return parts.findIndex((p) => p.type === "day") < parts.findIndex((p) => p.type === "month");
};

/** The locale the month and weekday names are written in. */
const shortWordsLocale = (language?: string): string => {
  const chosen = preferences.dateFormat;
  if (chosen === "SYSTEM") return systemLocale(language) ?? "en-GB";
  return wordsLocale(chosen, language);
};

const toCalendarDate = (value: string | Date): Date =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) ? isoToDate(value.trim()) : new Date(value);

const monthName = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, { month: "short" }).format(date).replace(/\.$/, "");
const weekdayName = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date).replace(/\.$/, "");

/** One date in the short style: "11 Nov", "Wed, 11 Nov", "Nov 11", "11 Nov 2025". */
export const formatShortDate = (value: string | Date | null | undefined, options?: ShortDateOptions): string => {
  if (value == null || value === "") return "";
  const date = toCalendarDate(value);
  if (Number.isNaN(date.getTime())) return typeof value === "string" ? value : "";
  const locale = shortWordsLocale(options?.language);
  const thisYear = (options?.today ?? new Date()).getFullYear();
  const dm = dayFirst(options?.language)
    ? `${date.getDate()} ${monthName(date, locale)}`
    : `${monthName(date, locale)} ${date.getDate()}`;
  const withYear = date.getFullYear() === thisYear ? dm : `${dm} ${date.getFullYear()}`;
  return options?.weekday ? `${weekdayName(date, locale)}, ${withYear}` : withYear;
};

/**
 * A span of days in the short style. One day reads as one date; a span inside a month shares it ("11–13 Nov",
 * "Wed–Fri, 11–13 Nov"); a span across months or years writes both ends ("30 Nov – 2 Dec", "28 Dec 2026 – 3 Jan
 * 2027").
 */
export const formatShortRange = (
  start: string | Date | null | undefined,
  end: string | Date | null | undefined,
  options?: ShortDateOptions,
): string => {
  if (start == null || start === "") return "";
  if (end == null || end === "") return formatShortDate(start, options);
  const a = toCalendarDate(start);
  const b = toCalendarDate(end);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return formatShortDate(start, options);
  if (dateToISO(a) === dateToISO(b)) return formatShortDate(a, options);

  const locale = shortWordsLocale(options?.language);
  const thisYear = (options?.today ?? new Date()).getFullYear();
  const crossesYear = a.getFullYear() !== b.getFullYear();
  if (crossesYear || a.getMonth() !== b.getMonth()) {
    // Both ends in full; a span crossing a year, or away from this one, names the year on both.
    const forceYear = crossesYear || a.getFullYear() !== thisYear;
    const one = (d: Date) => {
      const dm = dayFirst(options?.language) ? `${d.getDate()} ${monthName(d, locale)}` : `${monthName(d, locale)} ${d.getDate()}`;
      const y = forceYear ? `${dm} ${d.getFullYear()}` : dm;
      return options?.weekday ? `${weekdayName(d, locale)}, ${y}` : y;
    };
    return `${one(a)} – ${one(b)}`;
  }

  const days = `${a.getDate()}–${b.getDate()}`;
  const month = monthName(a, locale);
  const dm = dayFirst(options?.language) ? `${days} ${month}` : `${month} ${days}`;
  const withYear = a.getFullYear() === thisYear ? dm : `${dm} ${a.getFullYear()}`;
  return options?.weekday ? `${weekdayName(a, locale)}–${weekdayName(b, locale)}, ${withYear}` : withYear;
};

/** The short style in the page's language — for render. */
export const useShortDates = () => {
  const language = useDisplayLanguage();
  return {
    date: (value: string | Date | null | undefined, options?: Omit<ShortDateOptions, "language">) =>
      formatShortDate(value, { ...options, language }),
    range: (
      start: string | Date | null | undefined,
      end: string | Date | null | undefined,
      options?: Omit<ShortDateOptions, "language">,
    ) => formatShortRange(start, end, { ...options, language }),
  };
};
