"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { jobLevelGroupService } from "@/api/modules/jobLevelGroup/services";
import { jobCatalogErrorMessage } from "@/components/modules/settings/modules/jobcatalog/actions/shared";

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
    return {
      status: ActionStatus.ERROR,
      errorMessage: jobCatalogErrorMessage(
        error,
        "An error occurred while creating a job level group. Please try again."
      ),
    };
  }
};

export type CreateJobLevelGroupActionInput = { name: string };

export type CreateJobLevelGroupActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
