"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobLevelGroupService } from "@/api/modules/jobLevelGroup/services";
import { toActionError } from "@/lib/errors/withActionError";

export const updateJobLevelGroupAction = async (
  submission: UpdateJobLevelGroupActionInput
): Promise<UpdateJobLevelGroupActionOutput> => {
  try {
    const data = await jobLevelGroupService.updateJobLevelGroup(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "updateJobLevelGroupAction");
  }
};

export type UpdateJobLevelGroupActionInput = { id: string; name: string };

export type UpdateJobLevelGroupActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
