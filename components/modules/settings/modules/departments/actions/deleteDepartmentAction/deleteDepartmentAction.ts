"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDepartmentsService } from "@/api/modules/departments/services";
import type { DeleteDepartmentRequest } from "@/api/modules/departments/dto";
import { toActionError } from "@/lib/errors/withActionError";

export const deleteDepartmentAction = async (
  id: string,
  submission: DeleteDepartmentActionInput,
): Promise<DeleteDepartmentActionOutput> => {
  try {
    await hrisDepartmentsService.delete(id, submission);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "deleteDepartmentAction");
  }
};

export type DeleteDepartmentActionInput = DeleteDepartmentRequest;
export type DeleteDepartmentActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
