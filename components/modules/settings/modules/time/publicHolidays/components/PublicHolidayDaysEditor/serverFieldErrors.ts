import type { DraftHoliday, DraftHolidayErrors } from "./PublicHolidayDaysEditor";

/**
 * Turns the backend's `holidays[<index>]` map into row errors.
 *
 * The payload is built from the drafts in order, so the index the server reports is the position of
 * the row that was refused — the only link between a request the server validated and the rows the
 * person is looking at.
 */
export function mapServerFieldErrors(
  fieldErrors: Record<string, string> | undefined,
  holidays: DraftHoliday[],
): DraftHolidayErrors {
  if (!fieldErrors) return {};

  const rowErrors: DraftHolidayErrors = {};

  for (const [key, message] of Object.entries(fieldErrors)) {
    const match = /^holidays\[(\d+)]$/.exec(key);
    if (!match) continue;

    const holiday = holidays[Number(match[1])];
    if (holiday) rowErrors[holiday.localId] = { holidayDate: message };
  }

  return rowErrors;
}
