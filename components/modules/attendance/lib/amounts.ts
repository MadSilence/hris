import type { AttendanceAmount } from "@/models/attendance";

/**
 * The amount owed, as the screens print it: each currency in its own format, several joined with
 * " + " — never converted into one. Null when there is nothing to show: the reader may not see the
 * rate (`null` from the server), or nothing in the period carries a rate (an empty list). A screen then
 * prints nothing at all, not "0", which would claim a price that was never set.
 */
export const formatAmounts = (
  amounts: AttendanceAmount[] | null | undefined,
  locale?: string,
): string | null => {
  if (!amounts || amounts.length === 0) return null;
  return amounts.map((item) => formatAmount(item, locale)).join(" + ");
};

const formatAmount = ({ amount, currency }: AttendanceAmount, locale?: string): string => {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  } catch {
    // A code Intl does not know still prints, rather than taking the whole cell down.
    return `${amount.toFixed(2)} ${currency}`;
  }
};
