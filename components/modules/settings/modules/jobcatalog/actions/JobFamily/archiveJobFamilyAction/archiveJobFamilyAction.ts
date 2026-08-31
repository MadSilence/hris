"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "archiveJobFamilyAction");
  }
};

export type ArchiveJobFamilyActionInput = { id: string };

export type ArchiveJobFamilyActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
