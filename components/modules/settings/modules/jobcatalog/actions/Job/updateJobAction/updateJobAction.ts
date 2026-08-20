"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobsService } from "@/api/modules/jobs/services/jobsService";
import { jobCatalogErrorMessage } from "@/components/modules/settings/modules/jobcatalog/actions/shared";

export const updateJobAction = async (
  submission: UpdateJobActionInput
): Promise<UpdateJobActionOutput> => {
  try {
    const data = await jobsService.updateJob(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: jobCatalogErrorMessage(
        error,
        "An error occurred while updating a job. Please try again."
      ),
    };
  }
};

export type UpdateJobActionInput = { id: string; name?: string; familyId?: string; levelId?: string | null; clearLevel?: boolean;
  code?: string | null; clearCode?: boolean; description?: string | null; clearDescription?: boolean };

export type UpdateJobActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
