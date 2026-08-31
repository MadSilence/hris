"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import type { PublicHolidayYearFillResult } from "@/api/modules/publicHolidays/calendars/dto";
import { toActionError } from "@/lib/errors/withActionError";

/**
 * Pulls one year from the calendar's provider.
 *
 * Only an empty year is written. If the year already has days the backend reports what the source
 * would change and writes nothing — leave approved against those dates was costed with them.
 */
export const fillPublicHolidayYearAction = async (
  submission: FillPublicHolidayYearActionInput
): Promise<FillPublicHolidayYearActionOutput> => {
  try {
    const data = await hrisPublicHolidayCalendarsService.fillYear(
      submission.calendarId,
      submission.year
    );

    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "fillPublicHolidayYearAction");
  }
};

export type FillPublicHolidayYearActionInput = {
  calendarId: string;
  year: number;
};

export type FillPublicHolidayYearActionOutput = {
  status: ActionStatus;
  data?: PublicHolidayYearFillResult;
  errorMessage?: string;
};
