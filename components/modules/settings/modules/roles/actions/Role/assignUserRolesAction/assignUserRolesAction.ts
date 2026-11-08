"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisUserRolesService } from "@/api/modules/roles/services/hrisUserRolesService/hrisUserRolesService";
import { toActionError } from "@/lib/errors/withActionError";

export const assignUserRolesAction = async (
  submission: AssignUserRolesActionInput
): Promise<AssignUserRolesActionOutput> => {
  try {
    for (const roleId of submission.assignRoleIds) {
      await hrisUserRolesService.assignRole(submission.userId, roleId);
    }

    for (const roleId of submission.removeRoleIds) {
      await hrisUserRolesService.removeRole(submission.userId, roleId);
    }

    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "assignUserRolesAction");
  }
};

export type AssignUserRolesActionInput = {
  userId: string;
  assignRoleIds: string[];
  removeRoleIds: string[];
};

export type AssignUserRolesActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
