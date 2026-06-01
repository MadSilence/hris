"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyAssignmentsService } from "@/api/modules/timeOff/timeOffPolicyAssignments/services";
import type { EndTimeOffPolicyAssignmentRequest } from "@/api/modules/timeOff/timeOffPolicyAssignments/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const endTimeOffPolicyAssignmentAction = async (
  submission: EndTimeOffPolicyAssignmentActionInput
): Promise<EndTimeOffPolicyAssignmentActionOutput> => {
  try {
    const { assignmentId, ...body } = submission;
    const data = await hrisTimeOffPolicyAssignmentsService.end(
      assignmentId,
      body
    );

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("endTimeOffPolicyAssignmentAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while ending the policy assignment. Please try again.",
    };
  }
};

export type EndTimeOffPolicyAssignmentActionInput = {
  assignmentId: string;
  policyId: string;
} & EndTimeOffPolicyAssignmentRequest;

export type EndTimeOffPolicyAssignmentActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
