"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { jobLevelGroupService } from "@/api/modules/jobLevelGroup/services/jobLevelGroupService";

export const createJobLevelGroupAction = async (
  submission: CreateJobLevelGroupActionInput
): Promise<CreateJobLevelGroupActionOutput> => {
  try {
    const createEntity = await jobLevelGroupService.createJobLevelGroup(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: createEntity,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating a Job Level Group. Please try again.",
    };
  }
};

export type CreateJobLevelGroupActionInput = {
  name: string;
};

export type CreateJobLevelGroupActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
