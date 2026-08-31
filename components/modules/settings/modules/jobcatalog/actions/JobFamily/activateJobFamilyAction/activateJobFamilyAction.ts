"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";
import { toActionError } from "@/lib/errors/withActionError";

export const activateJobFamilyAction = async (
  submission: ActivateJobFamilyActionInput
): Promise<ActivateJobFamilyActionOutput> => {
  try {
    const data = await jobFamilyService.activateJobFamily(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "activateJobFamilyAction");
  }
};

export type ActivateJobFamilyActionInput = { id: string };

export type ActivateJobFamilyActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
