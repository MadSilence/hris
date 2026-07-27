"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { hrisApiRolesService } from "@/api/modules/roles/services/hrisRolesService/hrisApiRolesService";

export const createRoleAction = async (
  submission: CreateRoleActionInput
): Promise<CreateRoleActionOutput> => {
  try {
    const data = await hrisApiRolesService.createRole({
      name: submission.name,
      description: submission.description,
    });

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch {
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while creating role. Please try again.",
    };
  }
};

export type CreateRoleActionInput = {
  name: string;
  description?: string;
};

export type CreateRoleActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
