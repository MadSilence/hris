"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

/**
 * Takes a policy back out of the archive.
 *
 * There was no such action, because there was no such endpoint: a policy could be archived and
 * never brought back, which is the one thing `DECISIONS.md` \u00a7 "Every archive is reversible"
 * forbids. It returns DRAFT \u2014 activating it again is a separate, deliberate step.
 */
export const unarchiveTimeOffPolicyAction = async (
  submission: UnarchiveTimeOffPolicyActionInput
): Promise<UnarchiveTimeOffPolicyActionOutput> => {
  try {
    const data = await hrisTimeOffPoliciesService.unarchive(submission.id);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "unarchiveTimeOffPolicyAction");
  }
};

export type UnarchiveTimeOffPolicyActionInput = {
  id: string;
};

export type UnarchiveTimeOffPolicyActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
