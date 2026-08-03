"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import type { UpdateResponse } from "@/api/models/misc";

export const restorePublicHolidayCalendarAction = async (
  submission: RestorePublicHolidayCalendarActionInput
): Promise<RestorePublicHolidayCalendarActionOutput> => {
  try {
    const data = await hrisPublicHolidayCalendarsService.restore(submission.id);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("restorePublicHolidayCalendarAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while restoring the public holiday calendar. Please try again.",
    };
  }
};

export type RestorePublicHolidayCalendarActionInput = {
  id: string;
};

export type RestorePublicHolidayCalendarActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
