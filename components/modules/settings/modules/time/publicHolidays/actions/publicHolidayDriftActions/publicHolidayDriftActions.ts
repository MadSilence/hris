"use server";

// Every export is an explicit `async function`: Next refuses anything else in a "use server" file at
// request time, while tsc, eslint and jest all pass it (hris/CLAUDE.md, "Server Actions").

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import type { PublicHolidayDriftApplyResult } from "@/api/modules/publicHolidays/calendars/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

export type PublicHolidayDriftActionInput = {
  driftId: string;
};

/**
 * Applies what a holiday provider reported to the year it differs from: only the days the provider
 * owns, exactly the list the notification showed, and the leave under the moved days re-priced in the
 * same transaction. Answered from the drift notification.
 */
export async function applyPublicHolidayDriftAction(
  input: PublicHolidayDriftActionInput
): Promise<ActionResult<PublicHolidayDriftApplyResult>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisPublicHolidayCalendarsService.applyDrift(input.driftId) };
  } catch (error) {
    return toActionError(error, "applyPublicHolidayDriftAction");
  }
}

/** Declines it. Nothing is written to the calendar, and the same difference is not announced again. */
export async function dismissPublicHolidayDriftAction(
  input: PublicHolidayDriftActionInput
): Promise<ActionResult<void>> {
  try {
    await hrisPublicHolidayCalendarsService.dismissDrift(input.driftId);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "dismissPublicHolidayDriftAction");
  }
}
