"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyBlackoutsService } from "@/api/modules/timeOff/timeOffPolicyBlackouts/services";
import type { UpdateTimeOffPolicyBlackoutsRequest } from "@/api/modules/timeOff/timeOffPolicyBlackouts/dto";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "updateTimeOffPolicyBlackoutsAction");
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
