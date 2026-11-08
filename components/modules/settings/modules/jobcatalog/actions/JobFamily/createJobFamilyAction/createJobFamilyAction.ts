"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { jobFamilyService } from "@/api/modules/jobfamily/services/jobFamilyService";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "createJobFamilyAction");
  }
};

export type CreateJobFamilyActionInput = { name: string; description?: string | null };

export type CreateJobFamilyActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
