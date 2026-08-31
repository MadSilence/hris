"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "deactivatePublicHolidayCalendarAction");
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
