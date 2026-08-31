"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import type { CreatePublicHolidayCalendarRequest } from "@/api/modules/publicHolidays/calendars/dto";
import type { CreateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

export const createPublicHolidayCalendarAction = async (
  submission: CreatePublicHolidayCalendarActionInput
): Promise<CreatePublicHolidayCalendarActionOutput> => {
  try {
    const data = await hrisPublicHolidayCalendarsService.create(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "createPublicHolidayCalendarAction");
  }
};

export type CreatePublicHolidayCalendarActionInput =
  CreatePublicHolidayCalendarRequest;

export type CreatePublicHolidayCalendarActionOutput = {
  status: ActionStatus;
  data?: CreateResponse;
  errorMessage?: string;
};
