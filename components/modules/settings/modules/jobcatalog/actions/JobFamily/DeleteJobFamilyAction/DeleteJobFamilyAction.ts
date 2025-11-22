"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";

export const deleteJobFamilyAction = async (
  submission: DeleteJobFamilyActionInput
): Promise<DeleteJobFamilyActionOutput> => {
  try {
    await jobFamilyService.deleteJobFamily(submission);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deleting job families. Please try again.",
    };
  }
};

export type DeleteJobFamilyActionInput = {
  id: string;
};

export type DeleteJobFamilyActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
