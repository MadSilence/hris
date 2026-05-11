"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidayCalendarsService } from "@/api/modules/publicHolidays/calendars/services";
import type { CreatePublicHolidayCalendarRequest } from "@/api/modules/publicHolidays/calendars/dto";
import type { CreateResponse } from "@/api/models/misc";

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
    console.error("createPublicHolidayCalendarAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating the public holiday calendar. Please try again.",
    };
  }
};

export type CreatePublicHolidayCalendarActionInput =
  CreatePublicHolidayCalendarRequest;

export type CreatePublicHolidayCalendarActionOutput = {
  status: ActionStatus;
  data?: CreateResponse;
  errorMessage?: string;
};
