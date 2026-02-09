"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobLevelItemService } from "@/api/modules/jobLevelItem/services/jobLevelItemService";

export const updateJobLevelItemAction = async (
  submission: UpdateJobLevelItemActionInput
): Promise<UpdateJobLevelItemActionOutput> => {
  try {
    const updated = await jobLevelItemService.updateJobLevelItem(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: updated,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating the Job Level Item. Please try again.",
    };
  }
};

export type UpdateJobLevelItemActionInput = {
  id: string;
  name?: string;
};

export type UpdateJobLevelItemActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
