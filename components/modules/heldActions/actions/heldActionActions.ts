"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";
import { hrisHeldActionsService } from "@/api/modules/heldActions/services";
import type { HoldActionRequestDTO } from "@/api/modules/heldActions/dto";
import type { HeldAction } from "@/models/heldActions";

async function run<T>(context: string, body: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await body() };
  } catch (error) {
    return toActionError(error, context);
  }
}

/**
 * A screen's answer, held on the server until its `executeAt` (DECISIONS.md § "Undo and the Admin role"). A refusal
 * comes back now, with the code the direct endpoint would have answered (U-5).
 */
export async function holdActionAction(request: HoldActionRequestDTO): Promise<ActionResult<HeldAction>> {
  return run("holdActionAction", () => hrisHeldActionsService.hold(request));
}

/** Undo — refused with `HELD_ACTION_ALREADY_APPLIED` when it was too late. */
export async function cancelHeldActionAction(id: string): Promise<ActionResult<void>> {
  return run("cancelHeldActionAction", () => hrisHeldActionsService.cancel(id));
}

/** The toast was closed: apply it now rather than at `executeAt`. */
export async function applyHeldActionAction(id: string): Promise<ActionResult<void>> {
  return run("applyHeldActionAction", () => hrisHeldActionsService.apply(id));
}
