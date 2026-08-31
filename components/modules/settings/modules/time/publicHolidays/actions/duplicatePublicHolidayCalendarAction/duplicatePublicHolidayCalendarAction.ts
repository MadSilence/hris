"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import type { CreateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "duplicatePublicHolidayCalendarAction");
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
