"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { JobLevel } from "@/models/job";
import { jobLevelGroupService } from "@/api/modules/jobLevelGroup/services";
import { jobCatalogErrorMessage } from "@/components/modules/settings/modules/jobcatalog/actions/shared";

export const reorderJobLevelsAction = async (
  submission: ReorderJobLevelsActionInput
): Promise<ReorderJobLevelsActionOutput> => {
  try {
    const data = await jobLevelGroupService.reorderJobLevels(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: jobCatalogErrorMessage(
        error,
        "An error occurred while reordering job levels. Please try again."
      ),
    };
  }
};

export type ReorderJobLevelsActionInput = { groupId: string; levelIds: string[] };

export type ReorderJobLevelsActionOutput = {
  status: ActionStatus;
  data?: JobLevel[];
  errorMessage?: string;
};
