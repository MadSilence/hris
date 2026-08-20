"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";
import { jobCatalogErrorMessage } from "@/components/modules/settings/modules/jobcatalog/actions/shared";

export const archiveJobFamilyAction = async (
  submission: ArchiveJobFamilyActionInput
): Promise<ArchiveJobFamilyActionOutput> => {
  try {
    const data = await jobFamilyService.archiveJobFamily(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: jobCatalogErrorMessage(
        error,
        "An error occurred while archiving a job family. Please try again."
      ),
    };
  }
};

export type ArchiveJobFamilyActionInput = { id: string };

export type ArchiveJobFamilyActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
