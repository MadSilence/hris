"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { toActionError } from "@/lib/errors/withActionError";
import { hrisApiEmailService } from "@/api/modules/email/services";
import type { UnsubscribeResult } from "@/models/email";

type ActionResult<T = void> = {
  status: ActionStatus;
  data?: T;
  errorMessage?: string;
  code?: string;
  requestId?: string;
};

/** The unsubscribe page's own act (EMAIL_NOTIFICATIONS_DESIGN.md § 9.2): public, the token is the credential. */
export async function unsubscribeEmailAction(token: string): Promise<ActionResult<UnsubscribeResult>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisApiEmailService.unsubscribe(token) };
  } catch (error) {
    return toActionError(error, "unsubscribeEmailAction");
  }
}

export async function undoUnsubscribeEmailAction(token: string): Promise<ActionResult<UnsubscribeResult>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisApiEmailService.undoUnsubscribe(token) };
  } catch (error) {
    return toActionError(error, "undoUnsubscribeEmailAction");
  }
}

/** Manage account's "Try again" on a bounced address (AQ-08): the block lifted and the email sent again at once. */
export async function tryEmailAgainAction(userId: string): Promise<ActionResult<{ lifted: boolean; resent: string | null }>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisApiEmailService.tryAgain(userId) };
  } catch (error) {
    return toActionError(error, "tryEmailAgainAction");
  }
}
