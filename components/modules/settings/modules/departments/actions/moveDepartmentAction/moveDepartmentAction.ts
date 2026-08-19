"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDepartmentsService } from "@/api/modules/departments/services";
import type { MoveDepartmentRequest } from "@/api/modules/departments/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const moveDepartmentAction = async (
  id: string,
  submission: MoveDepartmentRequest,
): Promise<MoveDepartmentActionOutput> => {
  try {
    const data = await hrisDepartmentsService.move(id, submission);
    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    console.error("moveDepartmentAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while moving the department. Please try again.",
    };
  }
};

export type MoveDepartmentActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
