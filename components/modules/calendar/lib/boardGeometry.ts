import { addDays, startOfWeek, toISO } from "@/components/modules/calendar/lib/dateRange";

/**
 * The company calendar's geometry (`hris/design/screens/company-calendar`, N01–N25, measured at 1710 × 1112) — the
 * pure half, so it can be tested without a board.
 *
 * The board scrolls sideways without end (the owner's R5, 2026-11-20): it holds a run of loaded days and adds more as
 * the reader nears either end. A month is **fixed-width days** — 33 of them at 1710, fewer at 1440, never squeezed;
 * a week fills the board with seven.
 */

export type BoardScale = "month" | "week";

/** The people column (`pc`, 232 wide). */
export const NAME_COL = 232;
/** A day at month scale (`k-dn`, 38 wide) — never narrower. */
export const MONTH_DAY_W = 38;
/** A week day never goes under this, whatever the window. */
export const MIN_WEEK_DAY_W = 100;
/** A person row (52), a group band (32), the months row (30), the day row at each scale. */
export const ROW_H = 52;
export const BAND_H = 32;
export const MONTHS_ROW_H = 30;
export const DAY_ROW_H: Record<BoardScale, number> = { month: 46, week: 64 };
/** A leave pill (28 high, radius full) and the gap between two pills that overlap on one row. */
export const PILL_H = 28;
export const LANE_GAP = 4;

/** How many days are loaded on either side of the anchor at first, and how many each extension adds. */
const LOAD_BEFORE = 42;
const LOAD_AFTER = 126;
export const EXTEND_BY: Record<BoardScale, number> = { month: 63, week: 28 };

/** A day's width: fixed at month scale, a seventh of the free width at week scale. */
export const dayWidthFor = (scale: BoardScale, boardWidth: number): number =>
  scale === "month" ? MONTH_DAY_W : Math.max(MIN_WEEK_DAY_W, Math.floor((boardWidth - NAME_COL) / 7));

/** Whole days from `a` to `b`, local dates, safe over a daylight-saving change. */
export const daysBetween = (a: Date, b: Date): number =>
  Math.round(
    (Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) /
      86_400_000,
  );

/** `YYYY-MM-DD` → its index from `start`, local dates. */
export const indexOfISO = (start: Date, iso: string): number => daysBetween(start, new Date(`${iso}T00:00:00`));

/** The run of days the board holds: from `start`, `length` days. */
export type BoardRange = { start: Date; length: number };

/** Where the board lands: the first day of the company's week that holds `anchor`. */
export const landingDay = (anchor: Date, weekStartsOn: number): Date => startOfWeek(anchor, weekStartsOn);

/** The days loaded when the board opens on `anchor`. */
export const initialRange = (anchor: Date, weekStartsOn: number): BoardRange => ({
  start: addDays(landingDay(anchor, weekStartsOn), -LOAD_BEFORE),
  length: LOAD_BEFORE + LOAD_AFTER,
});

/** The range with `n` more days at the end, or (`back`) at the start. */
export const extendRange = (range: BoardRange, direction: "forward" | "back", n: number): BoardRange =>
  direction === "forward"
    ? { start: range.start, length: range.length + n }
    : { start: addDays(range.start, -n), length: range.length + n };

/** The range's last day, and both ends as ISO dates — the window the marks and leave are asked for. */
export const rangeEnd = (range: BoardRange): Date => addDays(range.start, range.length - 1);
export const rangeISO = (range: BoardRange): { from: string; to: string } => ({
  from: toISO(range.start),
  to: toISO(rangeEnd(range)),
});

/** The days of the range, as dates. */
export const rangeDays = (range: BoardRange): Date[] =>
  Array.from({ length: range.length }, (_, i) => addDays(range.start, i));

/**
 * Whether the reader is close enough to an end to load more: within one board's width of it. `back` wins only when
 * the reader is actually near the start, so a short board does not grow both ways at once.
 */
export const extensionNeeded = (scrollLeft: number, viewport: number, total: number): "forward" | "back" | null => {
  if (viewport <= 0) return null;
  if (scrollLeft < viewport * 0.5) return "back";
  if (scrollLeft + viewport > total - viewport) return "forward";
  return null;
};

/** A row's height for its lanes of pills: never under 52, so most rows never move. */
export const rowHeightFor = (lanes: number): number =>
  Math.max(ROW_H, lanes * PILL_H + Math.max(0, lanes - 1) * LANE_GAP + 16);

/** A pill's top in its row: the lanes centred together. */
export const pillTop = (rowHeight: number, lanes: number, lane: number): number => {
  const block = lanes * PILL_H + Math.max(0, lanes - 1) * LANE_GAP;
  return Math.round((rowHeight - block) / 2) + lane * (PILL_H + LANE_GAP);
};
