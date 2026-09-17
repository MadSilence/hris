"use server";

// Every export is an explicit `async function`: Next refuses anything else in a "use server" file.

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiAuthService } from "@/api/modules/auth/services/hrisAuthService";
import type { CompanyAddressReminderRequest } from "@/api/modules/auth/dto";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

/** "Don't know your company address?" Succeeds whether the email holds no account, one or many. */
export async function remindCompanyAddressesAction(
  payload: CompanyAddressReminderRequest,
): Promise<ActionResult<void>> {
  try {
    return {
      status: ActionStatus.SUCCESS,
      data: await hrisApiAuthService.remindCompanyAddresses({ email: payload.email }),
    };
  } catch (error) {
    return toActionError(error, "remindCompanyAddressesAction");
  }
}
