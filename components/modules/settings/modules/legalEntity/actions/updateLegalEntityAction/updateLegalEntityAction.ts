"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { legalEntityService } from "@/api/modules/legalEntity/services/legalEntityService";
import { toActionError } from "@/lib/errors/withActionError";

export const updateLegalEntityAction = async (
  submission: UpdateLegalEntityActionInput
): Promise<UpdateLegalEntityActionOutput> => {
  try {
    const updated = await legalEntityService.updateLegalEntity(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: updated,
    };
  } catch (error) {
    return toActionError(error, "updateLegalEntityAction");
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
  /** The version the form was opened with; a stale one comes back as E00409. */
  version?: number;
};

export type UpdateLegalEntityActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
