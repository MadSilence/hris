"use server"

import { ActionStatus } from "@/components/models/ActionStatus";
import { attributeService } from "@/api/modules/attributes/services/attributeService";
import { toActionError } from "@/lib/errors/withActionError";

export const deleteAttributeAction = async (
  submission: DeleteAttributeActionInput
): Promise<DeleteAttributeActionOutput> => {
  try {
    await attributeService.deleteAttribute(submission);

    return {
      status: ActionStatus.SUCCESS,
    }
  } catch (error) {
    return toActionError(error, "deleteAttributeAction");
  }
};

export type DeleteAttributeActionInput = {
  id: string;
};

export type DeleteAttributeActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
