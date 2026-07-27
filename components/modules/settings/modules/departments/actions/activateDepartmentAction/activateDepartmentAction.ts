"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDepartmentsService } from "@/api/modules/departments/services";

export const activateDepartmentAction = async (
  id: string,
): Promise<ActivateDepartmentActionOutput> => {
  try {
    await hrisDepartmentsService.activate(id);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("activateDepartmentAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while activating the department. Please try again.",
    };
  }
};

export type ActivateDepartmentActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
