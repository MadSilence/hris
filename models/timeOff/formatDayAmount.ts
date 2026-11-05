/**
 * Day amounts as people write them: whole days without a decimal point, half days with one.
 *
 * Time-off balances are `NUMERIC(10,2)` on the server, so a whole day arrives as `8` and a half day
 * as `7.5`. Rendering both with a fixed scale gives "8.0", which reads like a measurement rather
 * than a number of days.
 */
export const formatDayAmount = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

/**
 * The arguments of the plural messages `timeOff.amount.days` and `timeOff.amount.hours`: the plural is chosen by
 * `count`, the number is written by `formatDayAmount` — `t("amount.days", dayAmountArgs(7.5))` → "7.5 days",
 * `dayAmountArgs(1)` → "1 day". A caller in another namespace reads the message from a `timeOff` translator.
 */
export const dayAmountArgs = (value: number): { count: number; amount: string } => ({
  count: value,
  amount: formatDayAmount(value),
});
