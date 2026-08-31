"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobsService } from "@/api/modules/jobs/services/jobsService";
import { toActionError } from "@/lib/errors/withActionError";

export const updateJobAction = async (
  submission: UpdateJobActionInput
): Promise<UpdateJobActionOutput> => {
  try {
    const data = await jobsService.updateJob(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "updateJobAction");
  }
};

export type UpdateJobActionInput = { id: string; name?: string; familyId?: string; levelId?: string | null; clearLevel?: boolean;
  code?: string | null; clearCode?: boolean; description?: string | null; clearDescription?: boolean };

export type UpdateJobActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
