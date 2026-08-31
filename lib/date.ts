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
 * A date as a person reads it.
 *
 * **The one place a display format is chosen.** No component may name a locale of its own: a locale
 * inside a component is a setting stored where nobody can find or change it, which is how `ru-RU`
 * came to ship in an English-only product. See `DECISIONS.md` § "Dates are formatted in one place,
 * and no component holds a locale".
 *
 * The locale is an argument with exactly one caller today — the viewer's own, via `undefined`, which
 * is what `Intl` reads as "the browser's". When a company-level date format arrives it is supplied
 * here and no call site changes.
 *
 * `hideYear` serves the attribute option of the same name (birthdays, anniversaries). `style` keeps
 * the two shapes the product already uses — `numeric` (12.03.2026) in dense tables and profile rows,
 * `medium` (12 Mar 2026) where a date is read rather than scanned. Both were here before; the point
 * of this helper is that a locale is not.
 */
export const formatDisplayDate = (
  value: string | Date | null | undefined,
  options?: { hideYear?: boolean; locale?: string; style?: "numeric" | "medium" }
): string => {
  if (value == null || value === "") return "";

  // A bare `yyyy-MM-dd` is a calendar date, not an instant: parsing it through `new Date` reads it
  // as midnight UTC and shows the previous day to anyone west of Greenwich.
  const date =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())
      ? isoToDate(value.trim())
      : new Date(value);

  if (Number.isNaN(date.getTime())) return typeof value === "string" ? value : "";

  return new Intl.DateTimeFormat(options?.locale, {
    day: "2-digit",
    month: options?.style === "medium" ? "short" : "2-digit",
    ...(options?.hideYear ? {} : { year: "numeric" }),
  }).format(date);
};
