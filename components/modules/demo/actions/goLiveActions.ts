"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { demoService } from "@/api/modules/demo/demoService";
import { type ActionResult, toActionError } from "@/lib/errors/withActionError";
import type { GoLiveStatus } from "@/models/demo";

/** The owner asks to go live with what to keep (DEMO_PLAN.md 6.3). Nothing is erased until the company is activated. */
export async function requestGoLiveAction(keep: string[]): Promise<ActionResult<GoLiveStatus>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await demoService.requestGoLive(keep) };
  } catch (error) {
    return toActionError(error, "requestGoLiveAction");
  }
}

/** A run that stopped continues from where it stopped (DEMO_PLAN.md 6.5). */
export async function retryGoLiveAction(): Promise<ActionResult<GoLiveStatus>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await demoService.retryGoLive() };
  } catch (error) {
    return toActionError(error, "retryGoLiveAction");
  }
}
