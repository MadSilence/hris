"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisUserRolesService } from "@/api/modules/roles/services/hrisUserRolesService/hrisUserRolesService";
import { toActionError } from "@/lib/errors/withActionError";

export const removeUserFromRoleAction = async (
  submission: RemoveUserFromRoleActionInput
): Promise<RemoveUserFromRoleActionOutput> => {
  try {
    await hrisUserRolesService.removeRole(submission.userId, submission.roleId);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "removeUserFromRoleAction");
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
