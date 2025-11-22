"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";

export const renameJobFamilyAction = async (
  submission: RenameJobFamilyActionInput
): Promise<RenameJobFamilyActionOutput> => {
  try {
    const data = await jobFamilyService.renameJobFamily(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while renaming job family. Please try again.",
    };
  }
};

export type RenameJobFamilyActionInput = {
  id: string;
  name: string;
};

export type RenameJobFamilyActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
