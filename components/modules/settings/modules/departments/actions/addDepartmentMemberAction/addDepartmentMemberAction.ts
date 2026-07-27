"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDepartmentsService } from "@/api/modules/departments/services";

export const addDepartmentMemberAction = async (
  id: string,
  userId: string,
): Promise<AddDepartmentMemberActionOutput> => {
  try {
    await hrisDepartmentsService.addMember(id, { userId });
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("addDepartmentMemberAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while adding the member. Please try again.",
    };
  }
};

export type AddDepartmentMemberActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
