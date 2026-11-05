import { REVIEW_KIND_KEYS, type Cycle, type ReviewsT } from "@/models/reviews";

/** "Repeat" moves every date of a cycle by one to this many months (REVIEWS_PLAN.md 11.1; the backend's bound too). */
export const MAX_REPEAT_MONTHS = 36;

/** The shifts offered first; any whole number up to {@link MAX_REPEAT_MONTHS} can be typed. */
export const REPEAT_MONTH_PRESETS = [3, 6, 12] as const;

/**
 * An ISO date (`yyyy-mm-dd`) moved by whole months, as the backend's `LocalDate.plusMonths` moves it: a day the
 * target month does not have becomes its last day (31 January + 1 month = 28 February). Read from the string's parts,
 * never through `Date`, so no time zone can move it a day.
 */
export function shiftIsoDate(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const index = y * 12 + (m - 1) + months;
  const year = Math.floor(index / 12);
  const month = index - year * 12 + 1;
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = Math.min(d, last);
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Whether a typed number of months is one "Repeat" accepts. */
export const validRepeatMonths = (months: number) =>
  Number.isInteger(months) && months >= 1 && months <= MAX_REPEAT_MONTHS;

export type ShiftedDate = { label: string; from: string; to: string };

/**
 * Every date of a cycle and where "Repeat" would move it, in the order the builder shows them — what the Repeat
 * dialog previews before anything is written. A date the cycle does not have is left out.
 */
export function shiftedCycleDates(cycle: Cycle, months: number, t: ReviewsT): ShiftedDate[] {
  const out: ShiftedDate[] = [];
  const add = (label: string, iso: string | null) => {
    if (iso) out.push({ label, from: iso, to: shiftIsoDate(iso, months) });
  };
  add(t("copies.date.hiredBefore"), cycle.eligibleHiredBefore);
  for (const k of cycle.kinds) {
    const name = t(REVIEW_KIND_KEYS[k.kind]);
    add(t("copies.date.opens", { name }), k.opensOn);
    add(t("copies.date.due", { name }), k.dueOn);
    add(t("copies.date.nominatedBy"), k.nominationDueOn);
    add(t("copies.date.approvedBy"), k.approvalDueOn);
  }
  if (cycle.sharingMode === "RELEASED_ON_DATE") add(t("copies.date.released"), cycle.releaseDate);
  return out;
}
