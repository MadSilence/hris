"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisUserRolesService } from "@/api/modules/roles/services/hrisUserRolesService/hrisUserRolesService";

export const removeUserFromRoleAction = async (
  submission: RemoveUserFromRoleActionInput
): Promise<RemoveUserFromRoleActionOutput> => {
  try {
    await hrisUserRolesService.removeRole(submission.userId, submission.roleId);
    return { status: ActionStatus.SUCCESS };
  } catch {
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while removing the user from this role. Please try again.",
    };
  }
};

export type RemoveUserFromRoleActionInput = {
  userId: string;
  roleId: string;
};

export type RemoveUserFromRoleActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
