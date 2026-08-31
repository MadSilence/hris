"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyTenureRulesService } from "@/api/modules/timeOff/timeOffPolicyTenureRules/services";
import type { UpdateTimeOffPolicyTenureRulesRequest } from "@/api/modules/timeOff/timeOffPolicyTenureRules/dto";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "updateTimeOffPolicyTenureRulesAction");
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
