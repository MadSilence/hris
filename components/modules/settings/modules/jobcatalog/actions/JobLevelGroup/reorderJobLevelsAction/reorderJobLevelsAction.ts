"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { JobLevel } from "@/models/job";
import { jobLevelGroupService } from "@/api/modules/jobLevelGroup/services";
import { toActionError } from "@/lib/errors/withActionError";

export const reorderJobLevelsAction = async (
  submission: ReorderJobLevelsActionInput
): Promise<ReorderJobLevelsActionOutput> => {
  try {
    const data = await jobLevelGroupService.reorderJobLevels(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "reorderJobLevelsAction");
  }
};

export type ReorderJobLevelsActionInput = { groupId: string; levelIds: string[] };

export type ReorderJobLevelsActionOutput = {
  status: ActionStatus;
  data?: JobLevel[];
  errorMessage?: string;
};
