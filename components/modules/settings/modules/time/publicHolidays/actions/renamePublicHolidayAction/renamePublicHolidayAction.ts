"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";
import type { RenamePublicHolidayRequest } from "@/api/modules/publicHolidays/holidays/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const renamePublicHolidayAction = async (
  submission: RenamePublicHolidayActionInput
): Promise<RenamePublicHolidayActionOutput> => {
  try {
    const data = await hrisPublicHolidaysService.rename(
      submission.id,
      submission.body
    );

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("renamePublicHolidayAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while renaming the public holiday. Please try again.",
    };
  }
};

export type RenamePublicHolidayActionInput = {
  id: string;
  body: RenamePublicHolidayRequest;
};

export type RenamePublicHolidayActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
