"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { hrisApiRolesService } from "@/api/modules/roles/services/hrisRolesService/hrisApiRolesService";
import { toActionError } from "@/lib/errors/withActionError";

export const duplicateRoleAction = async (
  submission: DuplicateRoleActionInput
): Promise<DuplicateRoleActionOutput> => {
  try {
    const data = await hrisApiRolesService.duplicateRole(submission.id, { name: submission.name });

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "duplicateRoleAction");
  }
};

export type DuplicateRoleActionInput = {
  id: string;
  name: string;
};

export type DuplicateRoleActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
