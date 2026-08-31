"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDepartmentsService } from "@/api/modules/departments/services";
import { toActionError } from "@/lib/errors/withActionError";

export const activateDepartmentAction = async (
  id: string,
): Promise<ActivateDepartmentActionOutput> => {
  try {
    await hrisDepartmentsService.activate(id);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "activateDepartmentAction");
  }
};

export type ActivateDepartmentActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
