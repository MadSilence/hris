"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyTenureRulesService } from "@/api/modules/timeOff/timeOffPolicyTenureRules/services";
import type { UpdateTimeOffPolicyTenureRulesRequest } from "@/api/modules/timeOff/timeOffPolicyTenureRules/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const updateTimeOffPolicyTenureRulesAction = async (
  submission: UpdateTimeOffPolicyTenureRulesActionInput
): Promise<UpdateTimeOffPolicyTenureRulesActionOutput> => {
  try {
    const { policyId, ...body } = submission;
    const data = await hrisTimeOffPolicyTenureRulesService.update(policyId, body);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("updateTimeOffPolicyTenureRulesAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating tenure rewards. Please try again.",
    };
  }
};

export type UpdateTimeOffPolicyTenureRulesActionInput = {
  policyId: string;
} & UpdateTimeOffPolicyTenureRulesRequest;

export type UpdateTimeOffPolicyTenureRulesActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
