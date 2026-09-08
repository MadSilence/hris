"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services";
import type { CreateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

/**
 * Copy a policy and everything hanging off it, as a draft.
 *
 * The most expensive entity in the product to create was the only duplicable one without this — the
 * last run made a copy by editing a database row.
 */
export const duplicateTimeOffPolicyAction = async (
  submission: DuplicateTimeOffPolicyActionInput
): Promise<DuplicateTimeOffPolicyActionOutput> => {
  try {
    const data = await hrisTimeOffPoliciesService.duplicate(
      submission.id,
      submission.name,
    );

    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "duplicateTimeOffPolicyAction");
  }
};

export type DuplicateTimeOffPolicyActionInput = { id: string; name: string };

export type DuplicateTimeOffPolicyActionOutput = {
  status: ActionStatus;
  data?: CreateResponse;
  errorMessage?: string;
};
