"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiAuthService } from "@/api/modules/auth/services/hrisAuthService";
import type { EmailChangeConfirmResponse } from "@/api/modules/auth/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/** Makes the address the link was sent to the person's login. Uses the link, once. */
export async function confirmEmailChangeAction(token: string): Promise<ActionResult<EmailChangeConfirmResponse>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisApiAuthService.confirmEmailChange(token) };
  } catch (error) {
    return toActionError(error, "confirmEmailChangeAction");
  }
}
