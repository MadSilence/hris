"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyAccrualService } from "@/api/modules/timeOff/timeOffPolicyAccrual/services";
import type { UpdateTimeOffPolicyAccrualRequest } from "@/api/modules/timeOff/timeOffPolicyAccrual/dto";
import type { UpdateResponse } from "@/api/models/misc";

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
    console.error("updateTimeOffPolicyAccrualAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating accrual. Please try again.",
    };
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
