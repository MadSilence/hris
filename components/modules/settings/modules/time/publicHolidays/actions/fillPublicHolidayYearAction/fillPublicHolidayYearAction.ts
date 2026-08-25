"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import type { PublicHolidayYearFillResult } from "@/api/modules/publicHolidays/calendars/dto";

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
    console.error("fillPublicHolidayYearAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage: "Could not load holidays for that year. Please try again.",
    };
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
