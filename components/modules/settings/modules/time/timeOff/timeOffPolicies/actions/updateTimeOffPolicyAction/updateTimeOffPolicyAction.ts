"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import type { UpdateTimeOffPolicyRequest } from "@/api/modules/timeOff/timeOffPolicies/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const updateTimeOffPolicyAction = async (
  submission: UpdateTimeOffPolicyActionInput
): Promise<UpdateTimeOffPolicyActionOutput> => {
  try {
    const { id, ...body } = submission;
    const data = await hrisTimeOffPoliciesService.update(id, body);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("updateTimeOffPolicyAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating the time off policy. Please try again.",
    };
  }
};

export type UpdateTimeOffPolicyActionInput = { id: string } & UpdateTimeOffPolicyRequest;

export type UpdateTimeOffPolicyActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
