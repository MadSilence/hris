"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { toActionError } from "@/lib/errors/withActionError";
import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";
import type { ReplaceYearHolidayItem } from "@/api/modules/publicHolidays/holidays/dto";
import type { PublicHoliday } from "@/models/publicHolidays/holiday";

/**
 * Saves one calendar-year of days in a single request.
 *
 * Replaces the old loop of create/update/delete calls: a 17-day calendar meant 17 round trips, and a
 * failure partway through left the calendar half-written with nothing to roll back to.
 *
 * This action used to special-case `BadRequestError` to keep `fieldErrors` — the overlap message
 * names the row and the day it hit, and losing that costs the whole year's edits. Two things made
 * the special case unnecessary: `toActionError` returns `fieldErrors` for every API error, and an
 * overlap now answers 409 rather than 400, so the old `instanceof` check would have stopped
 * matching anyway.
 */
export const replacePublicHolidayYearAction = async (
  submission: ReplacePublicHolidayYearActionInput
): Promise<ReplacePublicHolidayYearActionOutput> => {
  try {
    const data = await hrisPublicHolidaysService.replaceYear(
      submission.calendarId,
      submission.year,
      { holidays: submission.holidays, version: submission.version }
    );

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "replacePublicHolidayYearAction");
  }
};

export type ReplacePublicHolidayYearActionInput = {
  calendarId: string;
  year: number;
  holidays: ReplaceYearHolidayItem[];
  /** The calendar's version the editor holds; absent for a calendar created a moment ago. */
  version?: number;
};

export type ReplacePublicHolidayYearActionOutput = {
  status: ActionStatus;
  data?: PublicHoliday[];
  errorMessage?: string;
  code?: string;
  requestId?: string;
  /** Keyed `holidays[<index into the payload>]` — the row the backend refused. */
  fieldErrors?: Record<string, string>;
};
