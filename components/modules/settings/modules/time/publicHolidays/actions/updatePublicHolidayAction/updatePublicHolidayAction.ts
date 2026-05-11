"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";
import type { UpdatePublicHolidayRequest } from "@/api/modules/publicHolidays/holidays/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const updatePublicHolidayAction = async (
  submission: UpdatePublicHolidayActionInput
): Promise<UpdatePublicHolidayActionOutput> => {
  try {
    const data = await hrisPublicHolidaysService.update(
      submission.id,
      submission.body
    );

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("updatePublicHolidayAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating the public holiday. Please try again.",
    };
  }
};

export type UpdatePublicHolidayActionInput = {
  id: string;
  body: UpdatePublicHolidayRequest;
};

export type UpdatePublicHolidayActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
