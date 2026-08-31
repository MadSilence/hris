"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { hrisApiRolesService } from "@/api/modules/roles/services/hrisRolesService/hrisApiRolesService";
import { toActionError } from "@/lib/errors/withActionError";

export const renameRoleAction = async (
  submission: RenameRoleActionInput
): Promise<RenameRoleActionOutput> => {
  try {
    // Partial patch: only what the form actually offered is sent, so a rename leaves the
    // description alone and vice versa.
    const data = await hrisApiRolesService.updateRoleName(submission.id, {
      newName: submission.name,
      description: submission.description,
    });

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "renameRoleAction");
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
