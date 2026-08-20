"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";
import { jobCatalogErrorMessage } from "@/components/modules/settings/modules/jobcatalog/actions/shared";

export const activateJobFamilyAction = async (
  submission: ActivateJobFamilyActionInput
): Promise<ActivateJobFamilyActionOutput> => {
  try {
    const data = await jobFamilyService.activateJobFamily(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: jobCatalogErrorMessage(
        error,
        "An error occurred while restoring a job family. Please try again."
      ),
    };
  }
};

export type ActivateJobFamilyActionInput = { id: string };

export type ActivateJobFamilyActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
