"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";

export const deletePublicHolidayAction = async (
  submission: DeletePublicHolidayActionInput
): Promise<DeletePublicHolidayActionOutput> => {
  try {
    await hrisPublicHolidaysService.delete(submission.id);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    console.error("deletePublicHolidayAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deleting the public holiday. Please try again.",
    };
  }
};

export type DeletePublicHolidayActionInput = {
  id: string;
};

export type DeletePublicHolidayActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
