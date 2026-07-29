"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";

export const deleteTimeOffPolicyAction = async (
  submission: DeleteTimeOffPolicyActionInput
): Promise<DeleteTimeOffPolicyActionOutput> => {
  try {
    await hrisTimeOffPoliciesService.delete(submission.id);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    console.error("deleteTimeOffPolicyAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deleting the time off policy. Please try again.",
    };
  }
};

export type DeleteTimeOffPolicyActionInput = {
  id: string;
};

export type DeleteTimeOffPolicyActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
