"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { legalEntityService } from "@/api/modules/legalEntity/services/legalEntityService";

export const deleteLegalEntityAction = async (
  submission: DeleteLegalEntityActionInput
): Promise<DeleteLegalEntityActionOutput> => {
  try {
    await legalEntityService.deleteLegalEntity(submission);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deleting the legal entity. Please try again.",
    };
  }
};

export type DeleteLegalEntityActionInput = {
  id: string;
};

export type DeleteLegalEntityActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
