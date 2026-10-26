"use server";

// Every export is an explicit `async function`: Next refuses anything else in a "use server" file at
// request time, while tsc, eslint and jest all pass it (hris/CLAUDE.md, "Server Actions").

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisPublicHolidaysService } from "@/api/modules/publicHolidays/holidays/services";
import type { PublicHolidayOverrideRevertResultDTO } from "@/api/modules/publicHolidays/holidays/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

export type RevertPublicHolidayOverrideActionInput = {
  overrideId: string;
};

/**
 * "Revert to Provider": takes the company's override of a provider day back. The day becomes the
 * provider's version again — a changed day as the provider has it, a removed day back, a kept day the
 * provider dropped gone — and the leave under it is re-priced in the same transaction.
 */
export async function revertPublicHolidayOverrideAction(
  input: RevertPublicHolidayOverrideActionInput
): Promise<ActionResult<PublicHolidayOverrideRevertResultDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisPublicHolidaysService.revertOverride(input.overrideId) };
  } catch (error) {
    return toActionError(error, "revertPublicHolidayOverrideAction");
  }
}
