"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { jobLevelsService } from "@/api/modules/jobLevels/services";
import { jobCatalogErrorMessage } from "@/components/modules/settings/modules/jobcatalog/actions/shared";

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
    return {
      status: ActionStatus.ERROR,
      errorMessage: jobCatalogErrorMessage(
        error,
        "An error occurred while creating a job level. Please try again."
      ),
    };
  }
};

export type CreateJobLevelActionInput = { groupId: string; name: string };

export type CreateJobLevelActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
