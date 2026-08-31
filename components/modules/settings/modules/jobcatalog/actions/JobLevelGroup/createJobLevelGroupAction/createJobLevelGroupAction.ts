"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { jobLevelGroupService } from "@/api/modules/jobLevelGroup/services";
import { toActionError } from "@/lib/errors/withActionError";

export const createJobLevelGroupAction = async (
  submission: CreateJobLevelGroupActionInput
): Promise<CreateJobLevelGroupActionOutput> => {
  try {
    const data = await jobLevelGroupService.createJobLevelGroup(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "createJobLevelGroupAction");
  }
};

export type CreateJobLevelGroupActionInput = { name: string };

export type CreateJobLevelGroupActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
