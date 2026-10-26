"use server";

// Every export is an explicit `async function` — a `const` does not survive as a server action.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDelegationsService } from "@/api/modules/delegations/services";
import type { CreateDelegationRequest, DelegationDTO } from "@/api/modules/delegations/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

export async function createDelegationAction(payload: CreateDelegationRequest): Promise<ActionResult<DelegationDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisDelegationsService.create(payload) };
  } catch (error) {
    return toActionError(error, "createDelegationAction");
  }
}

export async function deleteDelegationAction(id: string): Promise<ActionResult<void>> {
  try {
    await hrisDelegationsService.remove(id);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "deleteDelegationAction");
  }
}
