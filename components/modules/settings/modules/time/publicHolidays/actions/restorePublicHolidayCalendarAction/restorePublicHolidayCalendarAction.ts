"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "restorePublicHolidayCalendarAction");
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
