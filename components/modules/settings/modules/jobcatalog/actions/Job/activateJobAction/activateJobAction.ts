"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobsService } from "@/api/modules/jobs/services/jobsService";
import { jobCatalogErrorMessage } from "@/components/modules/settings/modules/jobcatalog/actions/shared";

export const activateJobAction = async (
  submission: ActivateJobActionInput
): Promise<ActivateJobActionOutput> => {
  try {
    const data = await jobsService.activateJob(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: jobCatalogErrorMessage(
        error,
        "An error occurred while restoring a job. Please try again."
      ),
    };
  }
};

export type ActivateJobActionInput = { id: string };

export type ActivateJobActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
