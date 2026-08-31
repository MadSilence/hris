"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import type { CreateTimeOffPolicyRequest } from "@/api/modules/timeOff/timeOffPolicies/dto";
import type { CreateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

export const createTimeOffPolicyAction = async (
  submission: CreateTimeOffPolicyActionInput
): Promise<CreateTimeOffPolicyActionOutput> => {
  try {
    const data = await hrisTimeOffPoliciesService.create(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "createTimeOffPolicyAction");
  }
};

export type CreateTimeOffPolicyActionInput = CreateTimeOffPolicyRequest;

export type CreateTimeOffPolicyActionOutput = {
  status: ActionStatus;
  data?: CreateResponse;
  errorMessage?: string;
};
