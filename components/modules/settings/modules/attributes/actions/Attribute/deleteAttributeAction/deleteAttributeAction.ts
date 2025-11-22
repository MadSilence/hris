"use server"

import { ActionStatus } from "@/components/models/ActionStatus";
import { attributeService } from "@/api/modules/attributes/services/attributeService/attributeService";

export const deleteAttributeAction = async (
  submission: DeleteAttributeActionInput
): Promise<DeleteAttributeActionOutput> => {
  try {
    await attributeService.deleteAttribute(submission);

    return {
      status: ActionStatus.SUCCESS,
    }
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while deleting the attribute. Please try again."
    };
  }
};

export type DeleteAttributeActionInput = {
  id: string;
};

export type DeleteAttributeActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
