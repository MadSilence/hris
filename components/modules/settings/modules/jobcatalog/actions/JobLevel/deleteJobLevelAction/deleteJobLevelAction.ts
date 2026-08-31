"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { jobLevelsService } from "@/api/modules/jobLevels/services";
import { toActionError } from "@/lib/errors/withActionError";

export const deleteJobLevelAction = async (
  submission: DeleteJobLevelActionInput
): Promise<DeleteJobLevelActionOutput> => {
  try {
    await jobLevelsService.deleteJobLevel(submission);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    return toActionError(error, "deleteJobLevelAction");
  }
};

export type DeleteJobLevelActionInput = { id: string };

export type DeleteJobLevelActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
