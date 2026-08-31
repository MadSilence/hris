"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { jobLevelsService } from "@/api/modules/jobLevels/services";
import { toActionError } from "@/lib/errors/withActionError";

export const createJobLevelAction = async (
  submission: CreateJobLevelActionInput
): Promise<CreateJobLevelActionOutput> => {
  try {
    const data = await jobLevelsService.createJobLevel(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "createJobLevelAction");
  }
};

export type CreateJobLevelActionInput = { groupId: string; name: string };

export type CreateJobLevelActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
