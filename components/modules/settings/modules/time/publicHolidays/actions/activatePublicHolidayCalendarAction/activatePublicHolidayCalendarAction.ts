"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "activatePublicHolidayCalendarAction");
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
