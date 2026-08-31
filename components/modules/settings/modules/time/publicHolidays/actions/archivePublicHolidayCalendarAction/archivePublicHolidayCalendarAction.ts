"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

export const archivePublicHolidayCalendarAction = async (
  submission: ArchivePublicHolidayCalendarActionInput
): Promise<ArchivePublicHolidayCalendarActionOutput> => {
  try {
    const data = await hrisPublicHolidayCalendarsService.archive(submission.id);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "archivePublicHolidayCalendarAction");
  }
};

export type ArchivePublicHolidayCalendarActionInput = {
  id: string;
};

export type ArchivePublicHolidayCalendarActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
