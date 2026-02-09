"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { legalEntityService } from "@/api/modules/legalEntity/services/legalEntityService";

export const createLegalEntityAction = async (
  submission: CreateLegalEntityActionInput
): Promise<CreateLegalEntityActionOutput> => {
  try {
    const created = await legalEntityService.createLegalEntity(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: created,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating a legal entity. Please try again.",
    };
  }
};

export type CreateLegalEntityActionInput = {
  name: string;
  description: string;
  registrationNumber: string;
  taxId: string;
  country: string;
  city: string;
  street: string;
  building: string;
  postCode: string;
};

export type CreateLegalEntityActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
