"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import type { UpdateTimeOffPolicyRequest } from "@/api/modules/timeOff/timeOffPolicies/dto";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

export const updateTimeOffPolicyAction = async (
  submission: UpdateTimeOffPolicyActionInput
): Promise<UpdateTimeOffPolicyActionOutput> => {
  try {
    const { id, ...body } = submission;
    const data = await hrisTimeOffPoliciesService.update(id, body);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "updateTimeOffPolicyAction");
  }
};

export type UpdateTimeOffPolicyActionInput = { id: string } & UpdateTimeOffPolicyRequest;

export type UpdateTimeOffPolicyActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
