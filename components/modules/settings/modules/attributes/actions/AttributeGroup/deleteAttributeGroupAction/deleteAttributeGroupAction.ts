"use server"

import { ActionStatus } from "@/components/models/ActionStatus";
import { groupsService } from "@/api/modules/groups/services/groupsService";

export const deleteAttributeGroupAction = async (
  submission: DeleteAttributeGroupActionInput
): Promise<DeleteAttributeGroupActionOutput> => {
  try {
    await groupsService.deleteAttributeGroup(submission);

    return {
      status: ActionStatus.SUCCESS,
    }
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while deleting groups. Please try again."
    };
  }
};

export type DeleteAttributeGroupActionInput = {
  id: string;
};

export type DeleteAttributeGroupActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
