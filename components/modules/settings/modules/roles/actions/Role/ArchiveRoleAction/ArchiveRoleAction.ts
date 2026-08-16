"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiRolesService } from "@/api/modules/roles/services/hrisRolesService/hrisApiRolesService";

/**
 * Archive takes a role out of circulation without destroying it: assignments are kept, but the
 * role grants nothing until it is restored, and its holders are signed out so no stale token
 * carries the old rights.
 */
export const archiveRoleAction = async (
  submission: ArchiveRoleActionInput
): Promise<ArchiveRoleActionOutput> => {
  try {
    if (submission.archived) {
      await hrisApiRolesService.archiveRole(submission.id);
    } else {
      await hrisApiRolesService.restoreRole(submission.id);
    }
    return { status: ActionStatus.SUCCESS };
  } catch {
    return {
      status: ActionStatus.ERROR,
      errorMessage: submission.archived
        ? "An error occurred while archiving the role. Please try again."
        : "An error occurred while restoring the role. Please try again.",
    };
  }
};

export type ArchiveRoleActionInput = {
  id: string;
  /** true = archive, false = restore. */
  archived: boolean;
};

export type ArchiveRoleActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
