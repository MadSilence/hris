"use server";

// Every export is an explicit `async function` — a `const` does not survive as a server action.

import { ActionStatus } from "@/components/models/ActionStatus";
import { personalSignInService } from "@/api/modules/identity/services";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

export async function setFirstPasswordAction(password: string): Promise<ActionResult<void>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await personalSignInService.setPassword(password) };
  } catch (error) {
    return toActionError(error, "setFirstPasswordAction");
  }
}

export async function removePasswordAction(): Promise<ActionResult<void>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await personalSignInService.removePassword() };
  } catch (error) {
    return toActionError(error, "removePasswordAction");
  }
}

export async function disconnectAccountAction(provider: "GOOGLE" | "MICROSOFT"): Promise<ActionResult<void>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await personalSignInService.disconnect(provider) };
  } catch (error) {
    return toActionError(error, "disconnectAccountAction");
  }
}
