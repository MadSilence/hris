"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyEligibilityService } from "@/api/modules/timeOff/timeOffPolicyEligibility/services";
import type { UpdateTimeOffPolicyEligibilityRequest } from "@/api/modules/timeOff/timeOffPolicyEligibility/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const updateTimeOffPolicyEligibilityAction = async (
  submission: UpdateTimeOffPolicyEligibilityActionInput
): Promise<UpdateTimeOffPolicyEligibilityActionOutput> => {
  try {
    const { policyId, ...body } = submission;
    const data = await hrisTimeOffPolicyEligibilityService.update(policyId, body);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("updateTimeOffPolicyEligibilityAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating eligibility. Please try again.",
    };
  }
};

export type UpdateTimeOffPolicyEligibilityActionInput = {
  policyId: string;
} & UpdateTimeOffPolicyEligibilityRequest;

export type UpdateTimeOffPolicyEligibilityActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
