"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import type { UpdateResponse } from "@/api/models/misc";

export const deactivatePublicHolidayCalendarAction = async (
  submission: DeactivatePublicHolidayCalendarActionInput
): Promise<DeactivatePublicHolidayCalendarActionOutput> => {
  try {
    const data = await hrisPublicHolidayCalendarsService.deactivate(
      submission.id
    );

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("deactivatePublicHolidayCalendarAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deactivating the public holiday calendar. Please try again.",
    };
  }
};

export type DeactivatePublicHolidayCalendarActionInput = {
  id: string;
};

export type DeactivatePublicHolidayCalendarActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
