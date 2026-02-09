"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobLevelGroupService } from "@/api/modules/jobLevelGroup/services/jobLevelGroupService";

export const updateJobLevelGroupAction = async (
  submission: UpdateJobLevelGroupActionInput
): Promise<UpdateJobLevelGroupActionOutput> => {
  try {
    const updated = await jobLevelGroupService.updateJobLevelGroup(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: updated,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating the Job Level Group. Please try again.",
    };
  }
};

export type UpdateJobLevelGroupActionInput = {
  id: string;
  name?: string;
};

export type UpdateJobLevelGroupActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
