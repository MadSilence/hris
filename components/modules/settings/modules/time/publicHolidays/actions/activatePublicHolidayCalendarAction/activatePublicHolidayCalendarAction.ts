"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import type { UpdateResponse } from "@/api/models/misc";

export const activatePublicHolidayCalendarAction = async (
  submission: ActivatePublicHolidayCalendarActionInput
): Promise<ActivatePublicHolidayCalendarActionOutput> => {
  try {
    const data = await hrisPublicHolidayCalendarsService.activate(submission.id);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("activatePublicHolidayCalendarAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while activating the public holiday calendar. Please try again.",
    };
  }
};

export type ActivatePublicHolidayCalendarActionInput = {
  id: string;
};

export type ActivatePublicHolidayCalendarActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
