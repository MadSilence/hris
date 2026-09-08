"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

/**
 * The approver answers a cancellation the employee asked for.
 *
 * One action with a decision rather than two, because the two calls differ only in which endpoint
 * they hit and the UI always has the decision in hand. The *endpoints* stay two — that split is the
 * backend's, and it is what makes the journal readable.
 */
export const decideCancellationAction = async (
  submission: DecideCancellationActionInput
): Promise<DecideCancellationActionOutput> => {
  try {
    // userId only rides along so the calling hook knows which cache to invalidate.
    const { requestId, decision } = submission;
    const data =
      decision === "CONFIRM"
        ? await hrisTimeOffRequestsService.confirmCancellation(requestId)
        : await hrisTimeOffRequestsService.declineCancellation(requestId);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "decideCancellationAction");
  }
};

export type CancellationDecision = "CONFIRM" | "DECLINE";

export type DecideCancellationActionInput = {
  requestId: string;
  userId: string;
  decision: CancellationDecision;
};

export type DecideCancellationActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
