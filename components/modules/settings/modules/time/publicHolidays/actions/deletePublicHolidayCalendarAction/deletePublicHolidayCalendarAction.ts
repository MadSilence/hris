"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";

export const deletePublicHolidayCalendarAction = async (
  submission: DeletePublicHolidayCalendarActionInput
): Promise<DeletePublicHolidayCalendarActionOutput> => {
  try {
    await hrisPublicHolidayCalendarsService.delete(submission.id);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    console.error("deletePublicHolidayCalendarAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deleting the public holiday calendar. Please try again.",
    };
  }
};

export type DeletePublicHolidayCalendarActionInput = {
  id: string;
};

export type DeletePublicHolidayCalendarActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
