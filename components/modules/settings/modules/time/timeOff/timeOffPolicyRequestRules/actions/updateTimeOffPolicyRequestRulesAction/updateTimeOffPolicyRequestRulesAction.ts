"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyRequestRulesService } from "@/api/modules/timeOff/timeOffPolicyRequestRules/services";
import type { UpdateTimeOffPolicyRequestRulesRequest } from "@/api/modules/timeOff/timeOffPolicyRequestRules/dto";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "updateTimeOffPolicyRequestRulesAction");
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
