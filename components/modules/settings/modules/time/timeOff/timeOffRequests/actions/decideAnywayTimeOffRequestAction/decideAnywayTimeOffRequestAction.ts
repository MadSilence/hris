"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

export type DecideAnywayDecision = "APPROVE" | "REJECT";

export type DecideAnywayActionInput = {
  requestId: string;
  decision: DecideAnywayDecision;
  /** Required for REJECT, as for any rejection. */
  rejectionReason?: string;
};

/**
 * Approve Anyway / Reject Anyway: an administrator decides over the approval chain. Whether they may
 * is the backend's answer (PEOPLE.TIME_OFF MANAGE reaching the requester); this only carries the ask.
 */
export async function decideAnywayTimeOffRequestAction(
  input: DecideAnywayActionInput,
): Promise<ActionResult<UpdateResponse>> {
  try {
    return {
      status: ActionStatus.SUCCESS,
      data: await hrisTimeOffRequestsService.decideAnyway(input.requestId, input.decision, input.rejectionReason),
    };
  } catch (error) {
    return toActionError(error, "decideAnywayTimeOffRequestAction");
  }
}
