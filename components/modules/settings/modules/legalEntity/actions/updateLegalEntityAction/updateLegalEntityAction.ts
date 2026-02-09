"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { legalEntityService } from "@/api/modules/legalEntity/services/legalEntityService";

export const updateLegalEntityAction = async (
  submission: UpdateLegalEntityActionInput
): Promise<UpdateLegalEntityActionOutput> => {
  try {
    const updated = await legalEntityService.updateLegalEntity(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: updated,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating the legal entity. Please try again.",
    };
  }
};

export type UpdateLegalEntityActionInput = {
  id: string;
  name?: string;
  description?: string;
  isSystem: boolean;
  registrationNumber?: string;
  taxId?: string;
  country?: string;
  city?: string;
  street?: string;
  building?: string;
  postCode?: string;
};

export type UpdateLegalEntityActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
