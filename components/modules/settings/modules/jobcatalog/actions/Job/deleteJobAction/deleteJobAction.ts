"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { jobsService } from "@/api/modules/jobs/services/jobsService";
import { jobCatalogErrorMessage } from "@/components/modules/settings/modules/jobcatalog/actions/shared";

export const deleteJobAction = async (
  submission: DeleteJobActionInput
): Promise<DeleteJobActionOutput> => {
  try {
    await jobsService.deleteJob(submission);

    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: jobCatalogErrorMessage(
        error,
        "An error occurred while deleting a job. Please try again."
      ),
    };
  }
};

export type DeleteJobActionInput = { id: string };

export type DeleteJobActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
