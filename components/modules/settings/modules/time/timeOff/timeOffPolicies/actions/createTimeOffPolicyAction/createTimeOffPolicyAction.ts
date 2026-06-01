"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import type { CreateTimeOffPolicyRequest } from "@/api/modules/timeOff/timeOffPolicies/dto";
import type { CreateResponse } from "@/api/models/misc";

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
    console.error("createTimeOffPolicyAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating the time off policy. Please try again.",
    };
  }
};

export type CreateTimeOffPolicyActionInput = CreateTimeOffPolicyRequest;

export type CreateTimeOffPolicyActionOutput = {
  status: ActionStatus;
  data?: CreateResponse;
  errorMessage?: string;
};
