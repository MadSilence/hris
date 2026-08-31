"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { jobLevelGroupService } from "@/api/modules/jobLevelGroup/services";
import { toActionError } from "@/lib/errors/withActionError";

export const deleteJobLevelGroupAction = async (
  submission: DeleteJobLevelGroupActionInput
): Promise<DeleteJobLevelGroupActionOutput> => {
  try {
    await jobLevelGroupService.deleteJobLevelGroup(submission);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    return toActionError(error, "deleteJobLevelGroupAction");
  }
};

export type DeleteJobLevelGroupActionInput = { id: string };

export type DeleteJobLevelGroupActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
