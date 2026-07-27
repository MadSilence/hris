"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisDepartmentsService } from "@/api/modules/departments/services";

export const removeDepartmentMemberAction = async (
  id: string,
  userId: string,
): Promise<RemoveDepartmentMemberActionOutput> => {
  try {
    await hrisDepartmentsService.removeMember(id, userId);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("removeDepartmentMemberAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while removing the member. Please try again.",
    };
  }
};

export type RemoveDepartmentMemberActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
