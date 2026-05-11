"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";
import type { CreatePublicHolidayRequest } from "@/api/modules/publicHolidays/holidays/dto";
import type { CreateResponse } from "@/api/models/misc";

export const createPublicHolidayAction = async (
  submission: CreatePublicHolidayActionInput
): Promise<CreatePublicHolidayActionOutput> => {
  try {
    const data = await hrisPublicHolidaysService.create(
      submission.calendarId,
      submission.body
    );

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("createPublicHolidayAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating the public holiday. Please try again.",
    };
  }
};

export type CreatePublicHolidayActionInput = {
  calendarId: string;
  body: CreatePublicHolidayRequest;
};

export type CreatePublicHolidayActionOutput = {
  status: ActionStatus;
  data?: CreateResponse;
  errorMessage?: string;
};
