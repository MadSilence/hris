"use server";

import { attributeService } from "@/api/modules/attributes/services/attributeService";
import { ActionStatus } from "@/components/models/ActionStatus";

export type UpdateAttributeOptionsActionInput = {
  attributeId: string;
  options: { id?: string; value: string; color: string; sortOrder?: number }[];
};

export type UpdateAttributeOptionsActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};

export const updateAttributeOptionsAction = async (
  input: UpdateAttributeOptionsActionInput
): Promise<UpdateAttributeOptionsActionOutput> => {
  try {
    await attributeService.setAttributeOptions(input.attributeId, input.options);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage:
        error instanceof Error && error.message
          ? error.message
          : "Failed to update options. Please try again.",
    };
  }
};
