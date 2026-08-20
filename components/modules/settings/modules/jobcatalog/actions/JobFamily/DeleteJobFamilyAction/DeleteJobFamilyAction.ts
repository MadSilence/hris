"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";
import { jobCatalogErrorMessage } from "@/components/modules/settings/modules/jobcatalog/actions/shared";

export const deleteJobFamilyAction = async (
  submission: DeleteJobFamilyActionInput
): Promise<DeleteJobFamilyActionOutput> => {
  try {
    await jobFamilyService.deleteJobFamily(submission);

    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: jobCatalogErrorMessage(
        error,
        "An error occurred while deleting a job family. Please try again."
      ),
    };
  }
};

export type DeleteJobFamilyActionInput = { id: string };

export type DeleteJobFamilyActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
