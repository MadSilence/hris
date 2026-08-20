"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobLevelsService } from "@/api/modules/jobLevels/services";
import { jobCatalogErrorMessage } from "@/components/modules/settings/modules/jobcatalog/actions/shared";

export const updateJobLevelAction = async (
  submission: UpdateJobLevelActionInput
): Promise<UpdateJobLevelActionOutput> => {
  try {
    const data = await jobLevelsService.updateJobLevel(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: jobCatalogErrorMessage(
        error,
        "An error occurred while updating a job level. Please try again."
      ),
    };
  }
};

export type UpdateJobLevelActionInput = { id: string; name: string };

export type UpdateJobLevelActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
