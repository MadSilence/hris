"use server"

import { ActionStatus } from "@/components/models/ActionStatus";
import { groupsService } from "@/api/modules/groups/services/groupsService";
import { ReorderItemRequest } from "@/api/modules/groups/dto";

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
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while reordering groups. Please try again."
    };
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
