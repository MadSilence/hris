"use server"

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { groupsService } from "@/api/modules/groups/services/groupsService";
import { toActionError } from "@/lib/errors/withActionError";

export const renameAttributeGroupAction = async (
  submission: RenameAttributeGroupActionInput
): Promise<RenameAttributeGroupActionOutput> => {
  try {
    const data = await groupsService.renameAttributeGroup(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: data
    }
  } catch (error) {
    return toActionError(error, "renameAttributeGroupAction");
  }
};

export type RenameAttributeGroupActionInput = {
  id: string;
  name: string;
};

export type RenameAttributeGroupActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
