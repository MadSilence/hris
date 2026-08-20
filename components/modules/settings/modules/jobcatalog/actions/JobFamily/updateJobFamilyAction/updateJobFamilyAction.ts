"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";
import { jobCatalogErrorMessage } from "@/components/modules/settings/modules/jobcatalog/actions/shared";

export const updateJobFamilyAction = async (
  submission: UpdateJobFamilyActionInput
): Promise<UpdateJobFamilyActionOutput> => {
  try {
    const data = await jobFamilyService.updateJobFamily(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: jobCatalogErrorMessage(
        error,
        "An error occurred while updating a job family. Please try again."
      ),
    };
  }
};

export type UpdateJobFamilyActionInput = { id: string; name?: string; description?: string | null; clearDescription?: boolean };

export type UpdateJobFamilyActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
