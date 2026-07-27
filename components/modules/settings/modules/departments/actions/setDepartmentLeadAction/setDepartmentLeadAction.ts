"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDepartmentsService } from "@/api/modules/departments/services";

export const setDepartmentLeadAction = async (
  id: string,
  userId: string,
): Promise<SetDepartmentLeadActionOutput> => {
  try {
    await hrisDepartmentsService.setLead(id, { userId });
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("setDepartmentLeadAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while setting the department lead. Please try again.",
    };
  }
};

export type SetDepartmentLeadActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
