"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import type { SaveTimeOffPolicyRequest } from "@/api/modules/timeOff/timeOffPolicies/dto";
import type { TimeOffPolicy } from "@/models/timeOff";
import { toActionError } from "@/lib/errors/withActionError";

/**
 * Saves every part of a policy in one call.
 *
 * Replaces ten sequential mutations from the wizard: those left the policy half-written whenever one
 * of them was refused, and no screen could say which half had landed.
 */
export const saveTimeOffPolicyAction = async (
  submission: SaveTimeOffPolicyActionInput
): Promise<SaveTimeOffPolicyActionOutput> => {
  try {
    const { id, ...body } = submission;
    const data = await hrisTimeOffPoliciesService.save(id, body);

    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "saveTimeOffPolicyAction");
  }
};

export type SaveTimeOffPolicyActionInput = { id: string } & SaveTimeOffPolicyRequest;

export type SaveTimeOffPolicyActionOutput = {
  status: ActionStatus;
  data?: TimeOffPolicy;
  errorMessage?: string;
};
