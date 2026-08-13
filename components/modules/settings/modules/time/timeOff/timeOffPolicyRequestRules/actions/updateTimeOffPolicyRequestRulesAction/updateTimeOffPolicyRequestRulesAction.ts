"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyRequestRulesService } from "@/api/modules/timeOff/timeOffPolicyRequestRules/services";
import type { UpdateTimeOffPolicyRequestRulesRequest } from "@/api/modules/timeOff/timeOffPolicyRequestRules/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const updateTimeOffPolicyRequestRulesAction = async (
  submission: UpdateTimeOffPolicyRequestRulesActionInput
): Promise<UpdateTimeOffPolicyRequestRulesActionOutput> => {
  try {
    const { policyId, ...body } = submission;
    const data = await hrisTimeOffPolicyRequestRulesService.update(policyId, body);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("updateTimeOffPolicyRequestRulesAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating the request rules. Please try again.",
    };
  }
};

export type UpdateTimeOffPolicyRequestRulesActionInput = {
  policyId: string;
} & UpdateTimeOffPolicyRequestRulesRequest;

export type UpdateTimeOffPolicyRequestRulesActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
