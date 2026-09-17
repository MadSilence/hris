"use server";

// Every export is an explicit `async function` — see acceptInviteAction for why.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiAuthService } from "@/api/modules/auth/services/hrisAuthService";
import type { ChangePasswordRequest } from "@/api/modules/auth/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/**
 * Changes the signed-in person's password. On success **every** session of theirs has ended, this one
 * included — the caller has to sign the browser out. A wrong current password comes back as
 * `AUTH00004` with `fieldErrors.currentPassword`.
 */
export async function changePasswordAction(payload: ChangePasswordRequest): Promise<ActionResult<void>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisApiAuthService.changePassword(payload) };
  } catch (error) {
    return toActionError(error, "changePasswordAction");
  }
}
