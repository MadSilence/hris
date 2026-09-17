"use server";

import { attributeService } from "@/api/modules/attributes/services/attributeService";
import { ActionStatus } from "@/components/models/ActionStatus";
import { toActionError } from "@/lib/errors/withActionError";

export type UpdateAttributeOptionsActionInput = {
  attributeId: string;
  options: { id?: string; value: string; color: string; sortOrder?: number }[];
  /** The attribute's version; a stale one comes back as E00409. */
  version?: number;
};

export type UpdateAttributeOptionsActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};

export async function updateAttributeOptionsAction(
  input: UpdateAttributeOptionsActionInput
): Promise<UpdateAttributeOptionsActionOutput> {
  try {
    await attributeService.setAttributeOptions(input.attributeId, input.options, input.version);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "updateAttributeOptionsAction");
  }
}
