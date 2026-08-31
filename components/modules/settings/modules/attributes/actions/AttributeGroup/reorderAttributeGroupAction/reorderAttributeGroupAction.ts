"use server"

import { ActionStatus } from "@/components/models/ActionStatus";
import { groupsService } from "@/api/modules/groups/services/groupsService";
import { ReorderItemRequest } from "@/api/modules/groups/dto";
import { toActionError } from "@/lib/errors/withActionError";

export const reorderAttributeGroupAction = async (
  submission: ReorderAttributeGroupActionInput[]
): Promise<ReorderAttributeGroupActionOutput> => {
  try {
    const payload: ReorderItemRequest[] = submission.map((item, index) => ({
      id: item.id,
      sortOrder: index + 1,
    }));

    await groupsService.reorderAttributeGroups(payload);

    return {
      status: ActionStatus.SUCCESS
    };
  } catch (error) {
    return toActionError(error, "reorderAttributeGroupAction");
  }
};

export type ReorderAttributeGroupActionInput = {
  id: string;
  sortOrder: number;
};

export type ReorderAttributeGroupActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
