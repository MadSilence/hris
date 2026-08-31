"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyAccrualService } from "@/api/modules/timeOff/timeOffPolicyAccrual/services";
import type { UpdateTimeOffPolicyAccrualRequest } from "@/api/modules/timeOff/timeOffPolicyAccrual/dto";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

export const updateTimeOffPolicyAccrualAction = async (
  submission: UpdateTimeOffPolicyAccrualActionInput
): Promise<UpdateTimeOffPolicyAccrualActionOutput> => {
  try {
    const { policyId, ...body } = submission;
    const data = await hrisTimeOffPolicyAccrualService.update(policyId, body);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "updateTimeOffPolicyAccrualAction");
  }
};

export type UpdateTimeOffPolicyAccrualActionInput = {
  policyId: string;
} & UpdateTimeOffPolicyAccrualRequest;

export type UpdateTimeOffPolicyAccrualActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
