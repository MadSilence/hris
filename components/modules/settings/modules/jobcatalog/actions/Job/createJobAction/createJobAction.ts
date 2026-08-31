"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { jobsService } from "@/api/modules/jobs/services/jobsService";
import { toActionError } from "@/lib/errors/withActionError";

export const createJobAction = async (
  submission: CreateJobActionInput
): Promise<CreateJobActionOutput> => {
  try {
    const data = await jobsService.createJob(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "createJobAction");
  }
};

export type CreateJobActionInput = { familyId: string; levelId?: string | null; name: string; code?: string | null; description?: string | null };

export type CreateJobActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
