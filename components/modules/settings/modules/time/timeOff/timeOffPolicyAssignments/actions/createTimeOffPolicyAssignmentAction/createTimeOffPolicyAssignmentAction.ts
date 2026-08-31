"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyAssignmentsService } from "@/api/modules/timeOff/timeOffPolicyAssignments/services";
import type { CreateTimeOffPolicyAssignmentRequest } from "@/api/modules/timeOff/timeOffPolicyAssignments/dto";
import type { CreateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "createTimeOffPolicyAssignmentAction");
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
