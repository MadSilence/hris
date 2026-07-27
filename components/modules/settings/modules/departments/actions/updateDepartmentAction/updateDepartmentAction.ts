"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDepartmentsService } from "@/api/modules/departments/services";
import type { UpdateDepartmentRequest } from "@/api/modules/departments/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const updateDepartmentAction = async (
  id: string,
  submission: UpdateDepartmentActionInput,
): Promise<UpdateDepartmentActionOutput> => {
  try {
    const data = await hrisDepartmentsService.update(id, submission);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("updateDepartmentAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while updating the department. Please try again.",
    };
  }
};

export type UpdateDepartmentActionInput = UpdateDepartmentRequest;
export type UpdateDepartmentActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
