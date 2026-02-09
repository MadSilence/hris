"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { jobLevelItemService } from "@/api/modules/jobLevelItem/services/jobLevelItemService";

export const deleteJobLevelItemAction = async (
  submission: DeleteJobLevelItemActionInput
): Promise<DeleteJobLevelItemActionOutput> => {
  try {
    await jobLevelItemService.deleteJobLevelItem(submission);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deleting Job Level Items. Please try again.",
    };
  }
};

export type DeleteJobLevelItemActionInput = {
  id: string;
};

export type DeleteJobLevelItemActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
