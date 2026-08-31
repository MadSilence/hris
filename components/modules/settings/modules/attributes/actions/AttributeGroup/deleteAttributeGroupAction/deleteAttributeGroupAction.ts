"use server"

import { ActionStatus } from "@/components/models/ActionStatus";
import { groupsService } from "@/api/modules/groups/services/groupsService";
import { toActionError } from "@/lib/errors/withActionError";

export const deleteAttributeGroupAction = async (
  submission: DeleteAttributeGroupActionInput
): Promise<DeleteAttributeGroupActionOutput> => {
  try {
    await groupsService.deleteAttributeGroup(submission);

    return {
      status: ActionStatus.SUCCESS,
    }
  } catch (error) {
    return toActionError(error, "deleteAttributeGroupAction");
  }
};

export type DeleteAttributeGroupActionInput = {
  id: string;
};

export type DeleteAttributeGroupActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
