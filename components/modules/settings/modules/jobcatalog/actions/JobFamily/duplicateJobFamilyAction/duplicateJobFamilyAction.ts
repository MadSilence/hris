"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";
import { jobCatalogErrorMessage } from "@/components/modules/settings/modules/jobcatalog/actions/shared";

export const duplicateJobFamilyAction = async (
  submission: DuplicateJobFamilyActionInput
): Promise<DuplicateJobFamilyActionOutput> => {
  try {
    const data = await jobFamilyService.duplicateJobFamily(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: jobCatalogErrorMessage(
        error,
        "An error occurred while duplicating a job family. Please try again."
      ),
    };
  }
};

export type DuplicateJobFamilyActionInput = { id: string; name: string };

export type DuplicateJobFamilyActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
