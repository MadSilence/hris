"use server";

import { attributeService } from "@/api/modules/attributes/services/attributeService";
import { ActionStatus } from "@/components/models/ActionStatus";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "updateAttributeOptionsAction");
  }
};
