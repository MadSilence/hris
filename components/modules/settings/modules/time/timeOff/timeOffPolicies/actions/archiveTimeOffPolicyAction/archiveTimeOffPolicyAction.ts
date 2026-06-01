"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import type { UpdateResponse } from "@/api/models/misc";

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
    console.error("archiveTimeOffPolicyAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while archiving the time off policy. Please try again.",
    };
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
