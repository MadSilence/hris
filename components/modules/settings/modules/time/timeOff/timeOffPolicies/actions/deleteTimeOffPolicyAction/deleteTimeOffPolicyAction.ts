"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import { toActionError } from "@/lib/errors/withActionError";

export const deleteTimeOffPolicyAction = async (
  submission: DeleteTimeOffPolicyActionInput
): Promise<DeleteTimeOffPolicyActionOutput> => {
  try {
    await hrisTimeOffPoliciesService.delete(submission.id);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    return toActionError(error, "deleteTimeOffPolicyAction");
  }
};

export type DeleteTimeOffPolicyActionInput = {
  id: string;
};

export type DeleteTimeOffPolicyActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
