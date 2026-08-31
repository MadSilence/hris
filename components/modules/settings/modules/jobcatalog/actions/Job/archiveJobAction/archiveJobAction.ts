"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { jobsService } from "@/api/modules/jobs/services/jobsService";
import { toActionError } from "@/lib/errors/withActionError";

export const archiveJobAction = async (
  submission: ArchiveJobActionInput
): Promise<ArchiveJobActionOutput> => {
  try {
    const data = await jobsService.archiveJob(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "archiveJobAction");
  }
};

export type ArchiveJobActionInput = { id: string };

export type ArchiveJobActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
