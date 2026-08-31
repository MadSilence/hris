"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "updateJobFamilyAction");
  }
};

export type UpdateJobFamilyActionInput = { id: string; name?: string; description?: string | null; clearDescription?: boolean };

export type UpdateJobFamilyActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
