"use server";

// Every export is an explicit `async function` — a `const` does not survive as a server action.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisUserAccountService } from "@/api/modules/userAccount/services";
import type { SignInProvider } from "@/api/modules/userAccount/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/** Logs a person out of one device (Manage account › Sessions › Log out). */
export async function endPersonSessionAction(userId: string, sessionId: string): Promise<ActionResult<void>> {
  try {
    await hrisUserAccountService.endSession(userId, sessionId);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "endPersonSessionAction");
  }
}

/** Unlinks a person's own Google or Microsoft account; the last way in is refused by Java (LAST_WAY_IN). */
export async function unlinkPersonSignInAccountAction(
  userId: string,
  provider: SignInProvider,
): Promise<ActionResult<void>> {
  try {
    await hrisUserAccountService.unlinkAccount(userId, provider);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "unlinkPersonSignInAccountAction");
  }
}
