"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyBlackoutsService } from "@/api/modules/timeOff/timeOffPolicyBlackouts/services";
import type { UpdateTimeOffPolicyBlackoutsRequest } from "@/api/modules/timeOff/timeOffPolicyBlackouts/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const updateTimeOffPolicyBlackoutsAction = async (
  submission: UpdateTimeOffPolicyBlackoutsActionInput
): Promise<UpdateTimeOffPolicyBlackoutsActionOutput> => {
  try {
    const { policyId, ...body } = submission;
    const data = await hrisTimeOffPolicyBlackoutsService.update(policyId, body);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("updateTimeOffPolicyBlackoutsAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating blackout periods. Please try again.",
    };
  }
};

export type UpdateTimeOffPolicyBlackoutsActionInput = {
  policyId: string;
} & UpdateTimeOffPolicyBlackoutsRequest;

export type UpdateTimeOffPolicyBlackoutsActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
