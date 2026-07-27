"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDepartmentsService } from "@/api/modules/departments/services";
import type { DeleteDepartmentRequest } from "@/api/modules/departments/dto";

export const deleteDepartmentAction = async (
  id: string,
  submission: DeleteDepartmentActionInput,
): Promise<DeleteDepartmentActionOutput> => {
  try {
    await hrisDepartmentsService.delete(id, submission);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("deleteDepartmentAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while deleting the department. Please try again.",
    };
  }
};

export type DeleteDepartmentActionInput = DeleteDepartmentRequest;
export type DeleteDepartmentActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
