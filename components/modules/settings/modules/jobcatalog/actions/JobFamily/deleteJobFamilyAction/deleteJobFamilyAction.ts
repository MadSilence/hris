"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";
import { toActionError } from "@/lib/errors/withActionError";

export const deleteJobFamilyAction = async (
  submission: DeleteJobFamilyActionInput
): Promise<DeleteJobFamilyActionOutput> => {
  try {
    await jobFamilyService.deleteJobFamily(submission);

    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "deleteJobFamilyAction");
  }
};

export type DeleteJobFamilyActionInput = { id: string };

export type DeleteJobFamilyActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
