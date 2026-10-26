"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDepartmentsService } from "@/api/modules/departments/services";
import { toActionError } from "@/lib/errors/withActionError";

/**
 * Restores the department. `restoreUnitIds` names the archived sub-units chosen to come back with it;
 * absent or empty, it comes back alone — which is what every caller did before the choice existed.
 */
export async function activateDepartmentAction(
  id: string,
  restoreUnitIds?: string[],
): Promise<ActivateDepartmentActionOutput> {
  try {
    await hrisDepartmentsService.activate(id, restoreUnitIds?.length ? { restoreUnitIds } : undefined);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "activateDepartmentAction");
  }
}

export type ActivateDepartmentActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
