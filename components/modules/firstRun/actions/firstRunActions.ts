"use server";

// Every export is an explicit `async function` — the rule the auth actions established.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisFirstRunService } from "@/api/modules/firstRun/services";
import type {
  CompanySetupDTO,
  CompanySetupSubmitRequest,
  UpdateUserSettingsRequest,
  UserSettingsDTO,
} from "@/api/modules/firstRun/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/**
 * Stores the owner's answers and starts building the company.
 *
 * Returns as soon as the answers are written: the work happens after the transaction commits, and
 * the screen follows it with `GET /company-setup`. A second submit while the first is running is
 * refused by the backend (CST0002) rather than doing everything twice.
 */
export async function submitCompanySetupAction(
  payload: CompanySetupSubmitRequest,
): Promise<ActionResult<CompanySetupDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisFirstRunService.submitCompanySetup(payload) };
  } catch (error) {
    return toActionError(error, "submitCompanySetupAction");
  }
}

export async function updateUserSettingsAction(
  payload: UpdateUserSettingsRequest,
): Promise<ActionResult<UserSettingsDTO>> {
  try {
    return { status: ActionStatus.SUCCESS, data: await hrisFirstRunService.updateUserSettings(payload) };
  } catch (error) {
    return toActionError(error, "updateUserSettingsAction");
  }
}

/** Finished or skipped — the same answer, and the reason this is one action and not two. */
export async function completeWelcomeAction(): Promise<ActionResult<void>> {
  try {
    await hrisFirstRunService.completeWelcome();
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "completeWelcomeAction");
  }
}
