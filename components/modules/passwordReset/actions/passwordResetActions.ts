"use server";

// Every export is an explicit `async function`. Next refuses anything else in a "use server" file —
// `export const x = withActionError(...)` compiles under tsc and fails at request time with "Server
// Actions must be async functions" — so the body catches with `toActionError`, the same middle.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiAuthService } from "@/api/modules/auth/services/hrisAuthService";
import type { ResetPasswordRequest } from "@/api/modules/auth/dto";
import { currentCompanySubdomain } from "@/api/modules/companyAddress";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/**
 * Asks for a reset link, inside the company whose address the page was opened at — the host, read
 * here on the server, never a field the browser sends. Succeeds whether or not the address has an
 * account there.
 */
export async function forgotPasswordAction(payload: { email: string }): Promise<ActionResult<void>> {
  try {
    const subdomain = (await currentCompanySubdomain()) ?? "";
    return {
      status: ActionStatus.SUCCESS,
      data: await hrisApiAuthService.forgotPassword({ email: payload.email, subdomain }),
    };
  } catch (error) {
    return toActionError(error, "forgotPasswordAction");
  }
}

/** Sets a new password with the link. Uses the link, once; signing in is a separate step. */
export async function resetPasswordAction(payload: ResetPasswordRequest): Promise<ActionResult<void>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisApiAuthService.resetPassword(payload) };
  } catch (error) {
    return toActionError(error, "resetPasswordAction");
  }
}
