/**
 * Перевод между `Date` и строкой `yyyy-MM-dd` — тем видом, в котором дата ходит по API.
 *
 * Оба направления работают в **локальном** времени, и это принципиально: `new Date("2026-01-01")`
 * парсится как полночь UTC, а `toISOString()` переводит обратно в UTC — на любой зоне западнее
 * Гринвича дата съезжает на день. Поэтому дата собирается и разбирается покомпонентно.
 */
export const pad = (n: number) => String(n).padStart(2, "0");

/** `Date` → `yyyy-MM-dd`, по локальным компонентам, без сдвига через UTC. */
export const dateToISO = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** `yyyy-MM-dd` → локальная полночь. */
export const isoToDate = (iso: string): Date => new Date(`${iso}T00:00:00`);

/** `yyyy-MM-dd` из отдельных чисел (месяц — как в `Date`, с нуля). */
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
};

const DEFAULT_PREFERENCES: DisplayPreferences = { timeZone: null, dateFormat: "SYSTEM" };

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
 */
export const formatDisplayDate = (
  value: string | Date | null | undefined,
  options?: { hideYear?: boolean; locale?: string; style?: "numeric" | "medium" }
): string => {
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
    return new Intl.DateTimeFormat(options?.locale, {
      day: "2-digit",
      month: options?.style === "medium" ? "short" : "2-digit",
      ...(options?.hideYear ? {} : { year: "numeric" }),
      ...(zone ? { timeZone: zone } : {}),
    }).format(date);
  }

  if (options?.style === "medium") {
    return new Intl.DateTimeFormat(LOCALE_FOR[chosen], {
      day: "2-digit",
      month: "short",
      ...(options?.hideYear ? {} : { year: "numeric" }),
      ...(zone ? { timeZone: zone } : {}),
    }).format(date);
  }

  const parts = numericParts(date, zone);
  return numericPattern(chosen, parts, options?.hideYear === true);
};

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
