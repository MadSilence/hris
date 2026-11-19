import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useOptionalCompanyData } from "@/components/providers/CompanyDataProvider/companyDataContext";
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
 * How dates are written on this page, and in whose zone.
 *
 * <p><b>The order is the company's, by its country</b> (DECISIONS.md § "The designers' Home fixes, round 1"): a
 * company in the US writes month first ("Nov 18", "11/18/2026"), every other company day first ("18 Nov",
 * "18.11.2026"). Nobody chooses it, and the browser's locale has no say. The language decides only the words; month
 * first exists only in English — a Russian page is day first for a US company too. The backend's twin is
 * `DateStyle.java`, which writes the emails.
 *
 * <p>A module-level value rather than a hook, because `formatDisplayDate` is called from table cells,
 * mappers and plain functions — threading a context through sixty call sites to change a format is
 * how the locale ended up hard-coded inside components in the first place. The hooks below read the company
 * from its context as well, so a component re-renders when the company arrives.
 *
 * <p><b>Only ever set in the browser.</b> On the server this module is shared by every request, so a
 * value written here would be one company's settings applied to the next company's page. The server keeps the
 * defaults, and so does the browser's first frame (the company is fetched after it), so the two agree.
 */
export type CompanyDateStyle = "US" | "EUROPEAN";

/** A company with no country on record writes the European order — `DateStyle.DEFAULT` on the backend. */
export const DEFAULT_DATE_STYLE: CompanyDateStyle = "EUROPEAN";

/** The style the company read answers, or the default for a missing or unknown one. */
export const dateStyleOf = (raw: string | null | undefined): CompanyDateStyle =>
  raw === "US" ? "US" : DEFAULT_DATE_STYLE;

type DisplayPreferences = {
  /** IANA zone, or null to use the browser's — which is what it always was. */
  timeZone: string | null;
  /** The company's order, set by `UserSettingsProvider` from the app-shell company read. */
  dateStyle: CompanyDateStyle;
  /**
   * The language the application speaks (`i18n/locales`), set by `LocaleBridge`; null until it is, which is
   * the browser's own locale — what every date did before there was a language. It decides the *words* of a
   * date (a month's name), never its order: the order is the company's (I18N.md § 2, rule 6).
   */
  language: string | null;
};

const DEFAULT_PREFERENCES: DisplayPreferences = { timeZone: null, dateStyle: DEFAULT_DATE_STYLE, language: null };

let preferences: DisplayPreferences = DEFAULT_PREFERENCES;

/** Applied by `UserSettingsProvider` once the person's settings and the company arrive. */
export const setDisplayPreferences = (next: Partial<DisplayPreferences>): void => {
  if (typeof window === "undefined") return;
  preferences = { ...DEFAULT_PREFERENCES, ...preferences, ...next };
};

/** For tests, and for signing out. */
export const resetDisplayPreferences = (): void => {
  preferences = DEFAULT_PREFERENCES;
};

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

/**
 * The locale numbers and names are written in once the application has a language: the browser's own when it
 * speaks the same language, otherwise the application's. Null before the language is known. **Never a date's
 * order** — that is the company's ({@link monthFirst}).
 */
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

/** Month before day: a US company, on an English page. Every other combination is day first. */
const monthFirst = (style: CompanyDateStyle | undefined, language?: string): boolean => {
  const lang = appLanguage(language) ?? "en";
  return (style ?? preferences.dateStyle) === "US" && lang === "en";
};

/**
 * The locale a date's words are written in: English's regional twin for the company's order (`en-US` writes
 * "Nov 18, 2026", `en-GB` "18 Nov 2026"), or the language itself, whose own order is day first.
 */
const wordsLocale = (style: CompanyDateStyle | undefined, explicit?: string): string => {
  const language = appLanguage(explicit) ?? "en";
  if (language !== "en") return language;
  return monthFirst(style, "en") ? "en-US" : "en-GB";
};

export type DisplayDateOptions = {
  hideYear?: boolean;
  locale?: string;
  /**
   * `numeric` (18.11.2026 / 11/18/2026) in dense tables and profile rows; `medium` (18 Nov 2026 / Nov 18, 2026)
   * where a date is read rather than scanned; `long` (18 November 2026 / November 18, 2026) in a sentence.
   */
  style?: "numeric" | "medium" | "long";
  language?: string;
  /** The company's order; the hooks pass it, everybody else gets what `UserSettingsProvider` set. */
  dateStyle?: CompanyDateStyle;
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
 * The order is the company's (its country), the words the page's language; an explicit `locale` from the caller
 * is the one escape hatch.
 *
 * **A calendar date carries no zone and is never moved by one.** `2026-03-12` is the twelfth of March
 * to everybody; only an instant — a `createdAt`, a notification's timestamp — is read in somebody's
 * zone, and that is the question `analysis/DATES_NUMBERS_TZ_ANALYSIS.md` § 4 asked.
 *
 * `hideYear` serves the attribute option of the same name (birthdays, anniversaries).
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
  const style = options?.style ?? "numeric";

  // An explicit locale from the caller still wins: it is the escape hatch for a screen that has a
  // reason, and there is exactly one such caller today.
  if (options?.locale) {
    return new Intl.DateTimeFormat(options.locale, {
      day: "2-digit",
      month: style === "numeric" ? "2-digit" : style === "long" ? "long" : "short",
      ...(options?.hideYear ? {} : { year: "numeric" }),
      ...(zone ? { timeZone: zone } : {}),
    }).format(date);
  }

  if (style !== "numeric") {
    return new Intl.DateTimeFormat(wordsLocale(options?.dateStyle, options?.language), {
      day: "numeric",
      month: style === "long" ? "long" : "short",
      ...(options?.hideYear ? {} : { year: "numeric" }),
      ...(zone ? { timeZone: zone } : {}),
    }).format(date);
  }

  const { day, month, year } = numericParts(date, zone);
  if (monthFirst(options?.dateStyle, options?.language)) {
    return options?.hideYear ? `${month}/${day}` : `${month}/${day}/${year}`;
  }
  return options?.hideYear ? `${day}.${month}` : `${day}.${month}.${year}`;
};

/** One bound formatter per language and order, so the hook hands back the same function on every render. */
const boundFormatters = new Map<string, DateFormatter>();

/**
 * {@link formatDisplayDate} bound to a language (and, from a hook, the company's order) — for a helper that is
 * handed one instead of a hook. Without `dateStyle` it follows what `UserSettingsProvider` set.
 */
export const dateFormatterFor = (language: string, dateStyle?: CompanyDateStyle): DateFormatter => {
  const key = `${language}|${dateStyle ?? ""}`;
  let bound = boundFormatters.get(key);
  if (!bound) {
    bound = (value, options) =>
      formatDisplayDate(value, {
        ...options,
        language: options?.language ?? language,
        dateStyle: options?.dateStyle ?? dateStyle,
      });
    boundFormatters.set(key, bound);
  }
  return bound;
};

/**
 * The company's order as the app-shell company read says it; the default outside the signed-in app (a public
 * signing page has no company context) and until the company arrives.
 */
export const useCompanyDateStyle = (): CompanyDateStyle => dateStyleOf(useOptionalCompanyData()?.company?.dateStyle);

export type WeekDayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const WEEK_DAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;

/** `MONDAY` → 1, as `Date.getDay()` counts; anything missing or unknown → Monday, `CompanySettings`' own default. */
export const weekStartsOnOf = (weekStartDay: string | null | undefined): WeekDayIndex => {
  const index = WEEK_DAY_NAMES.indexOf((weekStartDay ?? "").toUpperCase() as (typeof WEEK_DAY_NAMES)[number]);
  return (index < 0 ? 1 : index) as WeekDayIndex;
};

/**
 * The day the company's week starts on, as `Date.getDay()` counts (0 = Sunday, 1 = Monday) — for every calendar,
 * picker and week view. The company's `weekStartDay` (Settings → Company, set from the country at setup);
 * Monday until the company arrives, and outside the signed-in app.
 */
export const useWeekStartsOn = (): WeekDayIndex => weekStartsOnOf(useOptionalCompanyData()?.company?.weekStartDay);

/**
 * {@link formatDisplayDate} in the page's language — what every component formats a date with during render.
 * The language comes from `next-intl`'s `useLocale`, which the server knows per request, so the HTML the
 * server writes is already in the reader's language (a Russian page no longer says "Nov 12, 2026"), and the order
 * is the company's. The function is stable for a language and an order, safe in a dependency list.
 */
export const useDateFormatter = (): DateFormatter => {
  const dateStyle = useCompanyDateStyle();
  return dateFormatterFor(languageOf(useLocale()), dateStyle);
};

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

/**
 * The short style (the owner, 2026-11-05, C1; the order 2026-11-18): what a person reads in a panel or a dialog.
 * **No year for the current year**; the year appears for a date in another year, and on both ends of a range that
 * crosses one. The order is the company's, the words the page's language:
 *
 * | | European | US |
 * |---|---|---|
 * | a date | 18 Nov | Nov 18 |
 * | with its weekday | Wed, 18 Nov | Wed, Nov 18 |
 * | a span in a month | 25–27 Nov | Nov 25–27 |
 * | across months | 30 Nov – 2 Dec | Nov 30 – Dec 2 |
 * | with weekdays | Wed 25 – Fri 27 Nov | Wed, Nov 25 – Fri, Nov 27 |
 *
 * One date with its weekday takes a comma in both orders (SPEC § 1, the designers' widgets fixes A5, 2026-11-19:
 * "Fri, 20 Nov"); a span keeps the board's form without one ("Fri 4 – Mon 7 Dec"). A language other than English
 * keeps its own punctuation after a weekday ("ср, 18 нояб.").
 *
 * `hideYear` drops the year whatever it is — for the near dates a widget shows ("8 Jan", "back 4 Jan", widgets A7),
 * where the next year goes without saying.
 */
export type ShortDateOptions = {
  weekday?: boolean;
  hideYear?: boolean;
  language?: string;
  today?: Date;
  dateStyle?: CompanyDateStyle;
};

const toCalendarDate = (value: string | Date): Date =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) ? isoToDate(value.trim()) : new Date(value);

const monthName = (date: Date, locale: string, width: "short" | "long" = "short") =>
  new Intl.DateTimeFormat(locale, { month: width }).format(date).replace(/\.$/, "");
const weekdayName = (date: Date, locale: string, width: "short" | "long" = "short") =>
  new Intl.DateTimeFormat(locale, { weekday: width }).format(date).replace(/\.$/, "");

/** The pieces every short and long shape is assembled from, for one language and one order. */
const shapes = (options?: { language?: string; dateStyle?: CompanyDateStyle }) => {
  const mf = monthFirst(options?.dateStyle, options?.language);
  const locale = wordsLocale(options?.dateStyle, options?.language);
  // European English writes "Wed 18 Nov"; US English "Wed, Nov 18"; another language its own comma.
  const english = (appLanguage(options?.language) ?? "en") === "en";
  const afterWeekday = english && !mf ? " " : ", ";
  return { mf, locale, afterWeekday };
};

/** One date in the short style: "18 Nov", "Wed, 18 Nov", "Nov 18", "Wed, Nov 18", "18 Nov 2025". */
export const formatShortDate = (value: string | Date | null | undefined, options?: ShortDateOptions): string => {
  if (value == null || value === "") return "";
  const date = toCalendarDate(value);
  if (Number.isNaN(date.getTime())) return typeof value === "string" ? value : "";
  const { mf, locale } = shapes(options);
  const thisYear = (options?.today ?? new Date()).getFullYear();
  const dm = mf ? `${monthName(date, locale)} ${date.getDate()}` : `${date.getDate()} ${monthName(date, locale)}`;
  const withYear =
    options?.hideYear || date.getFullYear() === thisYear ? dm : mf ? `${dm}, ${date.getFullYear()}` : `${dm} ${date.getFullYear()}`;
  return options?.weekday ? `${weekdayName(date, locale)}, ${withYear}` : withYear;
};

/**
 * A span of days in the short style. One day reads as one date; a span inside a month shares it ("25–27 Nov",
 * "Nov 25–27"); a span across months or years writes both ends ("30 Nov – 2 Dec", "Dec 28, 2026 – Jan 3, 2027").
 * With weekdays every end carries its own ("Wed 25 – Fri 27 Nov").
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

  const { mf, locale, afterWeekday } = shapes(options);
  const thisYear = (options?.today ?? new Date()).getFullYear();
  const crossesYear = a.getFullYear() !== b.getFullYear();
  const wd = (d: Date) => (options?.weekday ? `${weekdayName(d, locale)}${afterWeekday}` : "");

  if (crossesYear || a.getMonth() !== b.getMonth()) {
    // Both ends in full; a span crossing a year names the year on both, one away from this year at its end.
    const yearOn = (d: Date, isEnd: boolean) =>
      !options?.hideYear && (crossesYear || (isEnd && a.getFullYear() !== thisYear)) ? d.getFullYear() : null;
    const one = (d: Date, isEnd: boolean) => {
      const y = yearOn(d, isEnd);
      const dm = mf ? `${monthName(d, locale)} ${d.getDate()}` : `${d.getDate()} ${monthName(d, locale)}`;
      return `${wd(d)}${y == null ? dm : mf ? `${dm}, ${y}` : `${dm} ${y}`}`;
    };
    return `${one(a, false)} – ${one(b, true)}`;
  }

  const month = monthName(a, locale);
  const year = options?.hideYear || a.getFullYear() === thisYear ? null : a.getFullYear();
  if (options?.weekday) {
    // Each end its weekday: "Wed 25 – Fri 27 Nov", "Wed, Nov 25 – Fri, Nov 27".
    const left = mf ? `${wd(a)}${month} ${a.getDate()}` : `${wd(a)}${a.getDate()}`;
    const right = mf ? `${wd(b)}${month} ${b.getDate()}` : `${wd(b)}${b.getDate()} ${month}`;
    return `${left} – ${right}${year == null ? "" : mf ? `, ${year}` : ` ${year}`}`;
  }
  const days = `${a.getDate()}–${b.getDate()}`;
  const dm = mf ? `${month} ${days}` : `${days} ${month}`;
  return year == null ? dm : mf ? `${dm}, ${year}` : `${dm} ${year}`;
};

/**
 * One date in the long style, the year always unless `hideYear`: "18 November 2026", "November 18, 2026"; with its
 * weekday "Wednesday, 18 November" / "Wednesday, November 18" (a heading, where the year goes without saying).
 */
export const formatLongDate = (
  value: string | Date | null | undefined,
  options?: { weekday?: boolean; hideYear?: boolean; language?: string; dateStyle?: CompanyDateStyle },
): string => {
  if (value == null || value === "") return "";
  const date = toCalendarDate(value);
  if (Number.isNaN(date.getTime())) return typeof value === "string" ? value : "";
  const { mf, locale } = shapes(options);
  const dm = mf ? `${monthName(date, locale, "long")} ${date.getDate()}` : `${date.getDate()} ${monthName(date, locale, "long")}`;
  const withYear = options?.hideYear ? dm : mf ? `${dm}, ${date.getFullYear()}` : `${dm} ${date.getFullYear()}`;
  if (!options?.weekday) {
    // A language's own genitive ("18 ноября 2026 г.") is Intl's to know, not a concatenation's.
    if ((appLanguage(options?.language) ?? "en") !== "en") {
      return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", ...(options?.hideYear ? {} : { year: "numeric" }) }).format(date);
    }
    return withYear;
  }
  if ((appLanguage(options?.language) ?? "en") !== "en") {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long", day: "numeric", month: "long", ...(options?.hideYear ? {} : { year: "numeric" }),
    }).format(date);
  }
  return `${weekdayName(date, locale, "long")}, ${withYear}`;
};

/** Midnight of the day `value` falls on, in the browser's zone. */
const dayStart = (value: Date): Date => new Date(value.getFullYear(), value.getMonth(), value.getDate());

/** Whole days from `from` to `to`, counted on the calendar (a DST change does not make a day 23 hours short of one). */
const calendarDaysBetween = (from: Date, to: Date): number =>
  Math.round((dayStart(to).getTime() - dayStart(from).getTime()) / 86_400_000);

/**
 * A day as a widget names it (the designers' widgets fixes A6, 2026-11-19): **its weekday alone while it falls in
 * this week** — the company's week, from `weekStartsOn` — "Thu", or "Thu 12" with `withDay`; **today** reads
 * `todayLabel` ("Today" / "today", from the caller's catalogue) when one is passed; any other day is the short date
 * without its weekday ("8 Jan", and with `hideYear` never a year). Past days of this week read the same ("Mon").
 */
export type DayThisWeekOptions = Omit<ShortDateOptions, "weekday"> & {
  weekStartsOn?: WeekDayIndex;
  todayLabel?: string;
  withDay?: boolean;
};

export const formatDayThisWeek = (value: string | Date | null | undefined, options?: DayThisWeekOptions): string => {
  if (value == null || value === "") return "";
  const date = toCalendarDate(value);
  if (Number.isNaN(date.getTime())) return typeof value === "string" ? value : "";
  const today = dayStart(options?.today ?? new Date());
  if (options?.todayLabel && calendarDaysBetween(today, date) === 0) return options.todayLabel;
  const weekStartsOn = options?.weekStartsOn ?? 1;
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() - weekStartsOn + 7) % 7));
  const offset = calendarDaysBetween(weekStart, date);
  if (offset >= 0 && offset < 7) {
    const { locale } = shapes(options);
    const weekday = weekdayName(date, locale);
    return options?.withDay ? `${weekday} ${date.getDate()}` : weekday;
  }
  return formatShortDate(date, { ...options, weekday: false });
};

/** The words {@link formatAgo} needs, from the caller's catalogue (`common.relative`). */
export type AgoLabels = {
  minutes: (count: number) => string;
  hours: (count: number) => string;
  yesterday: string;
};

/**
 * A moment as a widget's corner says it (the designers' widgets fixes A8, 2026-11-19): "5m ago" under an hour,
 * "15h ago" under a day, "Yesterday" for the calendar day before, the weekday ("Mon") inside the last week, and the
 * short date past that. A backend `LocalDateTime` has no zone suffix and is UTC wall-clock (`hris-api/CLAUDE.md` §
 * "Time and dates"), so a string without one is read as UTC, never as local time.
 */
export const formatAgo = (
  value: string | Date | null | undefined,
  labels: AgoLabels,
  options?: { now?: Date; language?: string; dateStyle?: CompanyDateStyle },
): string => {
  if (value == null || value === "") return "";
  let at: Date;
  if (value instanceof Date) at = value;
  else if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) at = isoToDate(value.trim());
  else at = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(value.trim()) ? value.trim() : `${value.trim()}Z`);
  if (Number.isNaN(at.getTime())) return "";
  const now = options?.now ?? new Date();
  const minutes = Math.floor((now.getTime() - at.getTime()) / 60_000);
  if (minutes < 60) return labels.minutes(Math.max(minutes, 1));
  if (minutes < 60 * 24) return labels.hours(Math.floor(minutes / 60));
  const days = calendarDaysBetween(at, now);
  if (days <= 1) return labels.yesterday;
  if (days < 7) return weekdayName(at, shapes(options).locale);
  return formatShortDate(at, { language: options?.language, dateStyle: options?.dateStyle, today: now });
};

/**
 * A time of day, the company's clock (the owner, 2026-11-18): a company in the US writes 12-hour times ("9:05 AM"),
 * every other company 24-hour ("09:05"). Nobody chooses it — like the month first, the 12-hour clock is English's, so
 * a Russian page of a US company reads "21:05". The backend's twin is `DateStyle.time`.
 *
 * <p>`timeZone` reads the instant in that zone (a company's, a schedule's); without it, the browser's — as every
 * time on a screen was read before this seam. `withZone` adds the zone's short name ("09:00 CET"), where a screen
 * draws one.
 */
export type TimeOptions = { language?: string; dateStyle?: CompanyDateStyle; timeZone?: string | null; withZone?: boolean };

/** Whether the company's clock is the 12-hour one — the US style on an English page. */
export const twelveHourClock = (options?: { language?: string; dateStyle?: CompanyDateStyle }): boolean =>
  monthFirst(options?.dateStyle, options?.language);

export const formatTime = (value: string | Date | null | undefined, options?: TimeOptions): string => {
  if (value == null || value === "") return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const twelve = twelveHourClock(options);
  const zone = options?.timeZone ?? undefined;
  return new Intl.DateTimeFormat(wordsLocale(options?.dateStyle, options?.language), {
    hour: twelve ? "numeric" : "2-digit",
    minute: "2-digit",
    hourCycle: twelve ? "h12" : "h23",
    ...(zone ? { timeZone: zone } : {}),
    ...(options?.withZone ? { timeZoneName: "short" as const } : {}),
  }).format(date);
};

/**
 * A wall-clock time with no date and no zone — `HH:mm` as the API spells it (an attendance span's From and To) — on
 * the company's clock: "09:00" stays "09:00", or reads "9:00 AM" for a US company. Anything else comes back as it was.
 */
export const formatTimeOfDay = (value: string | null | undefined, options?: Omit<TimeOptions, "timeZone" | "withZone">): string => {
  if (value == null || value === "") return "";
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
  if (!match) return value;
  const date = new Date(2000, 0, 1, Number(match[1]), Number(match[2]));
  return formatTime(date, options);
};

/** {@link formatTime} and {@link formatTimeOfDay} in the page's language and the company's clock — for render. */
export const useTimeFormatter = () => {
  const language = useDisplayLanguage();
  const dateStyle = useCompanyDateStyle();
  return useMemo(() => {
    const format = (value: string | Date | null | undefined, options?: Omit<TimeOptions, "language" | "dateStyle">) =>
      formatTime(value, { ...options, language, dateStyle });
    return Object.assign(format, {
      ofDay: (value: string | null | undefined) => formatTimeOfDay(value, { language, dateStyle }),
    });
  }, [language, dateStyle]);
};

/**
 * The short and long styles in the page's language and the company's order — for render. `day` is
 * {@link formatDayThisWeek} with the company's week and the catalogue's "Today" (`lowercase` for "back today");
 * `ago` is {@link formatAgo} with the catalogue's words.
 */
export const useShortDates = () => {
  const language = useDisplayLanguage();
  const dateStyle = useCompanyDateStyle();
  const weekStartsOn = useWeekStartsOn();
  const t = useTranslations("common");
  return useMemo(
    () => ({
      date: (value: string | Date | null | undefined, options?: Omit<ShortDateOptions, "language" | "dateStyle">) =>
        formatShortDate(value, { ...options, language, dateStyle }),
      range: (
        start: string | Date | null | undefined,
        end: string | Date | null | undefined,
        options?: Omit<ShortDateOptions, "language" | "dateStyle">,
      ) => formatShortRange(start, end, { ...options, language, dateStyle }),
      long: (value: string | Date | null | undefined, options?: { weekday?: boolean; hideYear?: boolean }) =>
        formatLongDate(value, { ...options, language, dateStyle }),
      day: (
        value: string | Date | null | undefined,
        options?: { lowercase?: boolean; withDay?: boolean; hideYear?: boolean; today?: Date },
      ) =>
        formatDayThisWeek(value, {
          ...options,
          language,
          dateStyle,
          weekStartsOn,
          todayLabel: options?.lowercase ? t("values.todayLower") : t("values.today"),
        }),
      ago: (value: string | Date | null | undefined, options?: { now?: Date }) =>
        formatAgo(
          value,
          {
            minutes: (count) => t("relative.minutesAgo", { count }),
            hours: (count) => t("relative.hoursAgo", { count }),
            yesterday: t("relative.yesterday"),
          },
          { ...options, language, dateStyle },
        ),
    }),
    [language, dateStyle, weekStartsOn, t],
  );
};
