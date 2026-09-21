"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";
import type {
  PatchUserClearable,
  PatchUserPayload,
} from "@/api/modules/users/clients/hrisApiUsersClient";
import { toActionError } from "@/lib/errors/withActionError";

/**
 * The person profile's one save: **one `PATCH /users/{id}`**, one transaction on the server.
 *
 * It used to be up to five calls — `/update`, then the manager, job, office and legal-entity
 * endpoints one after another — so a refusal on the fourth left the first three written. Now the
 * server checks every field the patch carries before it writes any of them, and a field the caller may
 * not edit refuses the whole save (as `/update` always did).
 */
export async function updateUserAction(
  submission: UpdateUserActionInput
): Promise<UpdateUserActionOutput> {
  try {
    await hrisApiUsersService.patchUser(submission.userId, toPatchPayload(submission));
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "updateUserAction");
  }
}

/**
 * The form's convention — `undefined` untouched, `null` clear — onto the wire's: a null cannot say
 * "clear" in a partial patch, so a cleared reference is named in `clear` instead.
 */
function toPatchPayload(submission: UpdateUserActionInput): PatchUserPayload {
  const { userId: _userId, managerId, jobId, officeId, legalEntityId, attributes, ...fields } = submission;

  const payload: PatchUserPayload = { ...fields };
  const clear: PatchUserClearable[] = [];

  const reference = (name: PatchUserClearable, value: string | null | undefined) => {
    if (value === undefined) return;
    if (value === null) clear.push(name);
    else payload[name] = value;
  };
  reference("managerId", managerId);
  reference("jobId", jobId);
  reference("officeId", officeId);
  reference("legalEntityId", legalEntityId);

  if (clear.length > 0) payload.clear = clear;
  if (attributes && Object.keys(attributes).length > 0) payload.attributes = attributes;
  return payload;
}

export type UpdateUserActionInput = {
  userId: string;
  /** The person's version when editing started — a colleague's save in between is refused (E00409). */
  version?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  hireDate?: string;
  probationEnd?: string;
  /** `undefined` = untouched, `null` = clear. Same convention for every association below. */
  managerId?: string | null;
  jobId?: string | null;
  officeId?: string | null;
  legalEntityId?: string | null;
  /** Custom attribute values by attribute id; `null` clears one. */
  attributes?: Record<string, unknown>;
};

export type UpdateUserActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
