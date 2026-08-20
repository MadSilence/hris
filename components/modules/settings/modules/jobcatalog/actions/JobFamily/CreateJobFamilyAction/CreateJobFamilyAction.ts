"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";
import { jobCatalogErrorMessage } from "@/components/modules/settings/modules/jobcatalog/actions/shared";

export const createJobFamilyAction = async (
  submission: CreateJobFamilyActionInput
): Promise<CreateJobFamilyActionOutput> => {
  try {
    const data = await jobFamilyService.createJobFamily(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: jobCatalogErrorMessage(
        error,
        "An error occurred while creating a job family. Please try again."
      ),
    };
  }
};

export type CreateJobFamilyActionInput = { name: string; description?: string | null };

export type CreateJobFamilyActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
