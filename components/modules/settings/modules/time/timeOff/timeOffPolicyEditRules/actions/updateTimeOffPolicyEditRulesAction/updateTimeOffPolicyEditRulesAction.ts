"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyEditRulesService } from "@/api/modules/timeOff/timeOffPolicyEditRules/services";
import type { UpdateTimeOffPolicyEditRulesRequest } from "@/api/modules/timeOff/timeOffPolicyEditRules/dto";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "updateTimeOffPolicyEditRulesAction");
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
