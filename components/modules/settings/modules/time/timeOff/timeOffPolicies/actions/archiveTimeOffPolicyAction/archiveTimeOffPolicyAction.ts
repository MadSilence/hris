"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

export const archiveTimeOffPolicyAction = async (
  submission: ArchiveTimeOffPolicyActionInput
): Promise<ArchiveTimeOffPolicyActionOutput> => {
  try {
    const data = await hrisTimeOffPoliciesService.archive(submission.id);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "archiveTimeOffPolicyAction");
  }
};

export type ArchiveTimeOffPolicyActionInput = {
  id: string;
};

export type ArchiveTimeOffPolicyActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
