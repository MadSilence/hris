"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { jobLevelGroupService } from "@/api/modules/jobLevelGroup/services/jobLevelGroupService";

export const deleteJobLevelGroupAction = async (
  submission: DeleteJobLevelGroupActionInput
): Promise<DeleteJobLevelGroupActionOutput> => {
  try {
    await jobLevelGroupService.deleteJobLevelGroup(submission);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deleting Job Level Groups. Please try again.",
    };
  }
};

export type DeleteJobLevelGroupActionInput = {
  id: string;
};

export type DeleteJobLevelGroupActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
