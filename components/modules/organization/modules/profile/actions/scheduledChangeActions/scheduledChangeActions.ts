"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisUserScheduledChangesService } from "@/api/modules/users/modules/scheduledChanges/services";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/**
 * Cancel one of the person's scheduled changes. Java runs the feature's own cancel — a termination
 * here is the same as `/terminate/cancel` — and decides whether this caller may.
 */
export async function cancelScheduledChangeAction(
  submission: { userId: string; changeId: string },
): Promise<ActionResult<void>> {
  try {
    return {
      status: ActionStatus.SUCCESS,
      data: await hrisUserScheduledChangesService.cancel(submission.userId, submission.changeId),
    };
  } catch (error) {
    return toActionError(error, "cancelScheduledChangeAction");
  }
}

/** Move a change to another day, where its kind allows it. `fieldErrors.date` for a day not ahead. */
export async function rescheduleScheduledChangeAction(
  submission: { userId: string; changeId: string; date: string },
): Promise<ActionResult<void>> {
  try {
    return {
      status: ActionStatus.SUCCESS,
      data: await hrisUserScheduledChangesService.reschedule(submission.userId, submission.changeId, submission.date),
    };
  } catch (error) {
    return toActionError(error, "rescheduleScheduledChangeAction");
  }
}
