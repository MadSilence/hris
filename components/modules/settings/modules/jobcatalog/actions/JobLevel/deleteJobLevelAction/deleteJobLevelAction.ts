"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { jobLevelsService } from "@/api/modules/jobLevels/services";
import { jobCatalogErrorMessage } from "@/components/modules/settings/modules/jobcatalog/actions/shared";

export const deleteJobLevelAction = async (
  submission: DeleteJobLevelActionInput
): Promise<DeleteJobLevelActionOutput> => {
  try {
    await jobLevelsService.deleteJobLevel(submission);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: jobCatalogErrorMessage(
        error,
        "An error occurred while deleting a job level. Please try again."
      ),
    };
  }
};

export type DeleteJobLevelActionInput = { id: string };

export type DeleteJobLevelActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
