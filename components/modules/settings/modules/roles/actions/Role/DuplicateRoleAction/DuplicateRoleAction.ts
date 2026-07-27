"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { hrisApiRolesService } from "@/api/modules/roles/services/hrisRolesService/hrisApiRolesService";

export const duplicateRoleAction = async (
  submission: DuplicateRoleActionInput
): Promise<DuplicateRoleActionOutput> => {
  try {
    const data = await hrisApiRolesService.duplicateRole(submission.id, { name: submission.name });

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch {
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while duplicating role. Please try again.",
    };
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
