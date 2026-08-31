"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobsService } from "@/api/modules/jobs/services/jobsService";
import { toActionError } from "@/lib/errors/withActionError";

export const activateJobAction = async (
  submission: ActivateJobActionInput
): Promise<ActivateJobActionOutput> => {
  try {
    const data = await jobsService.activateJob(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "activateJobAction");
  }
};

export type ActivateJobActionInput = { id: string };

export type ActivateJobActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
