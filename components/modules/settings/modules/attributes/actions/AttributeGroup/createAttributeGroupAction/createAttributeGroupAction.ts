"use server"

import { groupsService } from "@/api/modules/groups/services/groupsService";
import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

export const createAttributeGroupAction = async (
  submission: CreateAttributeGroupActionInput
): Promise<CreateAttributeGroupActionOutput> => {
  try {
    const createEntity = await groupsService.createGroup(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: createEntity,
    };
  } catch (error) {
    return toActionError(error, "createAttributeGroupAction");
  }
};

export type CreateAttributeGroupActionInput = {
  name: string;
  description?: string | null;
};

export type CreateAttributeGroupActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
