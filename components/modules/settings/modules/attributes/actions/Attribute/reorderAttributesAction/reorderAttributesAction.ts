"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { ReorderItemRequest } from "@/api/modules/groups/dto";
import { attributeService } from "@/api/modules/attributes/services/attributeService";

export type ReorderAttributesActionInput = {
  id: string;
  sortOrder: number;
};

export type ReorderAttributesActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};

export const reorderAttributesAction = async (
  submission: ReorderAttributesActionInput[]
): Promise<ReorderAttributesActionOutput> => {
  try {
    const payload: ReorderItemRequest[] = submission.map((item, index) => ({
      id: item.id,
      sortOrder: index + 1,
    }));

    await attributeService.reorderAttributes(payload);

    return { status: ActionStatus.SUCCESS };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while reordering attributes. Please try again.",
    };
  }
};
