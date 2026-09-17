"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import type {
  UpdatePublicHolidayCalendarRequest,
  UpdatePublicHolidayCalendarResponse,
} from "@/api/modules/publicHolidays/calendars/dto";
import { toActionError } from "@/lib/errors/withActionError";

export const updatePublicHolidayCalendarAction = async (
  submission: UpdatePublicHolidayCalendarActionInput
): Promise<UpdatePublicHolidayCalendarActionOutput> => {
  try {
    const data = await hrisPublicHolidayCalendarsService.update(
      submission.id,
      submission.body
    );

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "updatePublicHolidayCalendarAction");
  }
};

export type UpdatePublicHolidayCalendarActionInput = {
  id: string;
  body: UpdatePublicHolidayCalendarRequest;
};

export type UpdatePublicHolidayCalendarActionOutput = {
  status: ActionStatus;
  data?: UpdatePublicHolidayCalendarResponse;
  errorMessage?: string;
  code?: string;
};
