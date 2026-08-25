"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { BadRequestError } from "@/components/clients/exceptions";
import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";
import type { ReplaceYearHolidayItem } from "@/api/modules/publicHolidays/holidays/dto";
import type { PublicHoliday } from "@/models/publicHolidays/holiday";

/**
 * Saves one calendar-year of days in a single request.
 *
 * Replaces the old loop of create/update/delete calls: a 17-day calendar meant 17 round trips, and a
 * failure partway through left the calendar half-written with nothing to roll back to.
 */
export const replacePublicHolidayYearAction = async (
  submission: ReplacePublicHolidayYearActionInput
): Promise<ReplacePublicHolidayYearActionOutput> => {
  try {
    const data = await hrisPublicHolidaysService.replaceYear(
      submission.calendarId,
      submission.year,
      { holidays: submission.holidays }
    );

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("replacePublicHolidayYearAction error:", error);

    // A rejected save costs the whole year's edits, so the reason is worth passing on verbatim
    // instead of the usual "something went wrong" — overlaps name the row and the day they hit.
    if (error instanceof BadRequestError) {
      return {
        status: ActionStatus.ERROR,
        errorMessage: error.message,
        fieldErrors: error.fieldErrors,
      };
    }

    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while saving the holiday days. Please try again.",
    };
  }
};

export type ReplacePublicHolidayYearActionInput = {
  calendarId: string;
  year: number;
  holidays: ReplaceYearHolidayItem[];
};

export type ReplacePublicHolidayYearActionOutput = {
  status: ActionStatus;
  data?: PublicHoliday[];
  errorMessage?: string;
  /** Keyed `holidays[<index into the payload>]` — the row the backend refused. */
  fieldErrors?: Record<string, string>;
};
