"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import type { CreateResponse } from "@/api/models/misc";

export const duplicatePublicHolidayCalendarAction = async (
  submission: DuplicatePublicHolidayCalendarActionInput
): Promise<DuplicatePublicHolidayCalendarActionOutput> => {
  try {
    const data = await hrisPublicHolidayCalendarsService.duplicate(
      submission.id,
      submission.name
    );

    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("duplicatePublicHolidayCalendarAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while duplicating the public holiday calendar. Please try again.",
    };
  }
};

export type DuplicatePublicHolidayCalendarActionInput = {
  id: string;
  name?: string;
};

export type DuplicatePublicHolidayCalendarActionOutput = {
  status: ActionStatus;
  data?: CreateResponse;
  errorMessage?: string;
};
