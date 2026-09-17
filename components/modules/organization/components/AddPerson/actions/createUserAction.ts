"use server";

// Every export is an explicit `async function`. Next refuses anything else in a "use server" file —
// `export const x = withActionError(...)` compiles under tsc and fails at request time with "Server
// Actions must be async functions" — so the body catches with `toActionError`, the same middle.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";
import type { CreateUserPayload } from "@/api/modules/users/clients/hrisApiUsersClient";
import type { CreateResponse } from "@/api/models/misc";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/** Adds a person. The result is a draft: a record, no invitation, no password. */
export async function createUserAction(payload: CreateUserPayload): Promise<ActionResult<CreateResponse>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisApiUsersService.createUser(payload) };
  } catch (error) {
    return toActionError(error, "createUserAction");
  }
}
