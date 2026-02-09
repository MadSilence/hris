"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { jobLevelItemService } from "@/api/modules/jobLevelItem/services/jobLevelItemService";

export const createJobLevelItemAction = async (
  submission: CreateJobLevelItemActionInput
): Promise<CreateJobLevelItemActionOutput> => {
  try {
    const createEntity = await jobLevelItemService.createJobLevelItem(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: createEntity,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating a Job Level Item. Please try again.",
    };
  }
};

export type CreateJobLevelItemActionInput = {
  name: string;
};

export type CreateJobLevelItemActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
