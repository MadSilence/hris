"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { legalEntityService } from "@/api/modules/legalEntity/services/legalEntityService";
import { toActionError } from "@/lib/errors/withActionError";

export const deleteLegalEntityAction = async (
  submission: DeleteLegalEntityActionInput
): Promise<DeleteLegalEntityActionOutput> => {
  try {
    await legalEntityService.deleteLegalEntity(submission);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    return toActionError(error, "deleteLegalEntityAction");
  }
};

export type DeleteLegalEntityActionInput = {
  id: string;
};

export type DeleteLegalEntityActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
