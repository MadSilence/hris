"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "duplicateJobFamilyAction");
  }
};

export type DuplicateJobFamilyActionInput = { id: string; name: string };

export type DuplicateJobFamilyActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
