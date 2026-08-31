"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import { toActionError } from "@/lib/errors/withActionError";

export const deletePublicHolidayCalendarAction = async (
  submission: DeletePublicHolidayCalendarActionInput
): Promise<DeletePublicHolidayCalendarActionOutput> => {
  try {
    await hrisPublicHolidayCalendarsService.delete(submission.id);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    return toActionError(error, "deletePublicHolidayCalendarAction");
  }
};

export type DeletePublicHolidayCalendarActionInput = {
  id: string;
};

export type DeletePublicHolidayCalendarActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
