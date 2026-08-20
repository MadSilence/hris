"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobLevelGroupService } from "@/api/modules/jobLevelGroup/services";
import { jobCatalogErrorMessage } from "@/components/modules/settings/modules/jobcatalog/actions/shared";

export const updateJobLevelGroupAction = async (
  submission: UpdateJobLevelGroupActionInput
): Promise<UpdateJobLevelGroupActionOutput> => {
  try {
    const data = await jobLevelGroupService.updateJobLevelGroup(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: jobCatalogErrorMessage(
        error,
        "An error occurred while updating a job level group. Please try again."
      ),
    };
  }
};

export type UpdateJobLevelGroupActionInput = { id: string; name: string };

export type UpdateJobLevelGroupActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
