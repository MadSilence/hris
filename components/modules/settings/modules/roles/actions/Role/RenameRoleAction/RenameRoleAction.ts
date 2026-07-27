"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { hrisApiRolesService } from "@/api/modules/roles/services/hrisRolesService/hrisApiRolesService";

export const renameRoleAction = async (
  submission: RenameRoleActionInput
): Promise<RenameRoleActionOutput> => {
  try {
    // The backend update endpoint replaces the whole payload, so the current
    // description has to be sent back to avoid wiping it on a rename.
    const data = await hrisApiRolesService.updateRoleName(submission.id, {
      newName: submission.name,
      description: submission.description ?? "",
    });

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch {
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while renaming role. Please try again.",
    };
  }
};

export type RenameRoleActionInput = {
  id: string;
  name: string;
  description?: string;
};

export type RenameRoleActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
