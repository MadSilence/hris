"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobLevelsService } from "@/api/modules/jobLevels/services";
import { toActionError } from "@/lib/errors/withActionError";

export const updateJobLevelAction = async (
  submission: UpdateJobLevelActionInput
): Promise<UpdateJobLevelActionOutput> => {
  try {
    const data = await jobLevelsService.updateJobLevel(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "updateJobLevelAction");
  }
};

/** `version` is the one the rename form was opened with; a stale one comes back as E00409. */
export type UpdateJobLevelActionInput = { id: string; name: string; version?: number };

export type UpdateJobLevelActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
