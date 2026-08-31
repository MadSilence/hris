"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { hrisApiRolesService } from "@/api/modules/roles/services/hrisRolesService/hrisApiRolesService";
import { toActionError } from "@/lib/errors/withActionError";

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
  } catch (error) {
    return toActionError(error, "createRoleAction");
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
