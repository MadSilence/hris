"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { hrisApiRolesService } from "@/api/modules/roles/services/hrisRolesService/hrisApiRolesService";
import { toActionError } from "@/lib/errors/withActionError";

export async function renameRoleAction(
  submission: RenameRoleActionInput
): Promise<RenameRoleActionOutput> {
  try {
    // Partial patch: only what the form actually offered is sent, so a rename leaves the
    // description alone and vice versa. The version is the one the form was opened with.
    const data = await hrisApiRolesService.updateRoleName(submission.id, {
      newName: submission.name,
      description: submission.description,
      version: submission.version,
    });

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "renameRoleAction");
  }
}

export type RenameRoleActionInput = {
  id: string;
  name: string;
  description?: string;
  /** The role's version when the form opened; a stale one comes back as E00409. */
  version?: number;
};

export type RenameRoleActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
