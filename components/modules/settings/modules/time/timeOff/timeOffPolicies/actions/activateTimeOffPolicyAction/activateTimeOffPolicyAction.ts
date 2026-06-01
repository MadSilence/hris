"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import type { UpdateResponse } from "@/api/models/misc";

export const activateTimeOffPolicyAction = async (
  submission: ActivateTimeOffPolicyActionInput
): Promise<ActivateTimeOffPolicyActionOutput> => {
  try {
    const data = await hrisTimeOffPoliciesService.activate(submission.id);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("activateTimeOffPolicyAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while activating the time off policy. Please try again.",
    };
  }
};

export type ActivateTimeOffPolicyActionInput = {
  id: string;
};

export type ActivateTimeOffPolicyActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
