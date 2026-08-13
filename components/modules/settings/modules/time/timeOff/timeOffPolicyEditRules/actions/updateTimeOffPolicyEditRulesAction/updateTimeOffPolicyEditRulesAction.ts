"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyEditRulesService } from "@/api/modules/timeOff/timeOffPolicyEditRules/services";
import type { UpdateTimeOffPolicyEditRulesRequest } from "@/api/modules/timeOff/timeOffPolicyEditRules/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const updateTimeOffPolicyEditRulesAction = async (
  submission: UpdateTimeOffPolicyEditRulesActionInput
): Promise<UpdateTimeOffPolicyEditRulesActionOutput> => {
  try {
    const { policyId, ...body } = submission;
    const data = await hrisTimeOffPolicyEditRulesService.update(policyId, body);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("updateTimeOffPolicyEditRulesAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating the edit rules. Please try again.",
    };
  }
};

export type UpdateTimeOffPolicyEditRulesActionInput = {
  policyId: string;
} & UpdateTimeOffPolicyEditRulesRequest;

export type UpdateTimeOffPolicyEditRulesActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
