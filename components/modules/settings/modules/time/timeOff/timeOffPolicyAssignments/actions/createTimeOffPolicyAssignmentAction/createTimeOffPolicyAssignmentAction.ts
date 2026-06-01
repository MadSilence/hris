"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyAssignmentsService } from "@/api/modules/timeOff/timeOffPolicyAssignments/services";
import type { CreateTimeOffPolicyAssignmentRequest } from "@/api/modules/timeOff/timeOffPolicyAssignments/dto";
import type { CreateResponse } from "@/api/models/misc";

export const createTimeOffPolicyAssignmentAction = async (
  submission: CreateTimeOffPolicyAssignmentActionInput
): Promise<CreateTimeOffPolicyAssignmentActionOutput> => {
  try {
    const { policyId, ...body } = submission;
    const data = await hrisTimeOffPolicyAssignmentsService.create(
      policyId,
      body
    );

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("createTimeOffPolicyAssignmentAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating the policy assignment. Please try again.",
    };
  }
};

export type CreateTimeOffPolicyAssignmentActionInput = {
  policyId: string;
} & CreateTimeOffPolicyAssignmentRequest;

export type CreateTimeOffPolicyAssignmentActionOutput = {
  status: ActionStatus;
  data?: CreateResponse;
  errorMessage?: string;
};
