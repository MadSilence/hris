"use server";

// Every export is an explicit `async function` — a `const` does not survive as a server action.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisSessionsService } from "@/api/modules/sessions/services";
import type { SessionsEndedDTO } from "@/api/modules/sessions/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

export async function endMySessionAction(id: string): Promise<ActionResult<void>> {
  try {
    await hrisSessionsService.endMine(id);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "endMySessionAction");
  }
}

export async function endMyOtherSessionsAction(): Promise<ActionResult<SessionsEndedDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisSessionsService.endMyOthers() };
  } catch (error) {
    return toActionError(error, "endMyOtherSessionsAction");
  }
}

export async function endAllSessionsOfUserAction(userId: string): Promise<ActionResult<SessionsEndedDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisSessionsService.endAllOf(userId) };
  } catch (error) {
    return toActionError(error, "endAllSessionsOfUserAction");
  }
}
