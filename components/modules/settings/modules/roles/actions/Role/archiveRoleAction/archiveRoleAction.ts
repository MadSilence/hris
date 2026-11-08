"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiRolesService } from "@/api/modules/roles/services/hrisRolesService/hrisApiRolesService";
import { toActionError } from "@/lib/errors/withActionError";

/**
 * Archive takes a role out of circulation without destroying its permissions. It is taken from
 * everybody who held it (WALK_QUESTIONS § 22) and they are signed out so no stale token carries the
 * old rights; restoring brings the role back, not its holders.
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
  } catch (error) {
    return toActionError(error, "archiveRoleAction");
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
