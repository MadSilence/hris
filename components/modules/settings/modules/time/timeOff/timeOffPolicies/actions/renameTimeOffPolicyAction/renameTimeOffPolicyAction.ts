"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import type { RenameTimeOffPolicyRequest } from "@/api/modules/timeOff/timeOffPolicies/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const renameTimeOffPolicyAction = async (
  submission: RenameTimeOffPolicyActionInput
): Promise<RenameTimeOffPolicyActionOutput> => {
  try {
    const { id, ...body } = submission;
    const data = await hrisTimeOffPoliciesService.rename(id, body);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("renameTimeOffPolicyAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while renaming the time off policy. Please try again.",
    };
  }
};

export type RenameTimeOffPolicyActionInput = { id: string } & RenameTimeOffPolicyRequest;

export type RenameTimeOffPolicyActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
