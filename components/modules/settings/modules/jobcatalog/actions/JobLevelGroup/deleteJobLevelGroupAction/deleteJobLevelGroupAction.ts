"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { jobLevelGroupService } from "@/api/modules/jobLevelGroup/services";
import { jobCatalogErrorMessage } from "@/components/modules/settings/modules/jobcatalog/actions/shared";

export const deleteJobLevelGroupAction = async (
  submission: DeleteJobLevelGroupActionInput
): Promise<DeleteJobLevelGroupActionOutput> => {
  try {
    await jobLevelGroupService.deleteJobLevelGroup(submission);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: jobCatalogErrorMessage(
        error,
        "An error occurred while deleting a job level group. Please try again."
      ),
    };
  }
};

export type DeleteJobLevelGroupActionInput = { id: string };

export type DeleteJobLevelGroupActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
