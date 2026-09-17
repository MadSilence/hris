"use server";

// Every export is an explicit `async function`. Next refuses anything else in a "use server" file —
// `export const x = withActionError(...)` compiles under tsc and fails at request time with "Server
// Actions must be async functions" — so the body catches with `toActionError`, the same middle.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiAuthService } from "@/api/modules/auth/services/hrisAuthService";
import type { AcceptInviteRequest } from "@/api/modules/auth/dto";
import type { CreateResponse } from "@/api/models/misc";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/** Sets the password of an invited person. Uses the link, once; signing in is a separate step. */
export async function acceptInviteAction(payload: AcceptInviteRequest): Promise<ActionResult<CreateResponse>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisApiAuthService.acceptInvite(payload) };
  } catch (error) {
    return toActionError(error, "acceptInviteAction");
  }
}
