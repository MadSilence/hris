"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import type { RenamePublicHolidayCalendarRequest } from "@/api/modules/publicHolidays/calendars/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const renamePublicHolidayCalendarAction = async (
  submission: RenamePublicHolidayCalendarActionInput
): Promise<RenamePublicHolidayCalendarActionOutput> => {
  try {
    const data = await hrisPublicHolidayCalendarsService.rename(
      submission.id,
      submission.body
    );

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("renamePublicHolidayCalendarAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while renaming the public holiday calendar. Please try again.",
    };
  }
};

export type RenamePublicHolidayCalendarActionInput = {
  id: string;
  body: RenamePublicHolidayCalendarRequest;
};

export type RenamePublicHolidayCalendarActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
