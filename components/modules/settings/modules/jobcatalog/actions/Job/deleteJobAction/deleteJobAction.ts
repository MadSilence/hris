"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { jobsService } from "@/api/modules/jobs/services/jobsService";
import { toActionError } from "@/lib/errors/withActionError";

export const deleteJobAction = async (
  submission: DeleteJobActionInput
): Promise<DeleteJobActionOutput> => {
  try {
    await jobsService.deleteJob(submission);

    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "deleteJobAction");
  }
};

export type DeleteJobActionInput = { id: string };

export type DeleteJobActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
