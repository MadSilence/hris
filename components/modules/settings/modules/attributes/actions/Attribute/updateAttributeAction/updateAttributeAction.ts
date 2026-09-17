"use server"

import { attributeService } from "@/api/modules/attributes/services/attributeService";
import { ActionStatus } from "@/components/models/ActionStatus";
import { AttributeOption, AttributeType } from "@/models/attribute";
import { toActionError } from "@/lib/errors/withActionError";
import { AttributeUpdateResponse } from "@/api/modules/attributes/dto";

export async function updateAttributeAction(
  submission: UpdateAttributeActionInput
): Promise<UpdateAttributeActionOutput> {
  try {
    const data = await attributeService.updateAttribute(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: data,
    };
  } catch (error) {
    return toActionError(error, "updateAttributeAction");
  }
}

export type UpdateAttributeActionInput = {
  id: string;
  groupId?: string;
  name?: string;
  type?: AttributeType;
  unique?: boolean;
  sensitive?: boolean;
  decScale?: number | null;
  dateHideYear?: boolean;
  options?: AttributeOption[];
  required?: boolean;
  description?: string | null;
  defaultValue?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  onlyPositive?: boolean;
  minLength?: number | null;
  maxLength?: number | null;
  regex?: string | null;
  minDate?: string | null;
  maxDate?: string | null;
  minSelect?: number | null;
  maxSelect?: number | null;
  objectFields?: string | null;
  /** Nullable config fields to reset — a null above means "leave as is", not "clear". */
  clearFields?: string[];
  /** The attribute's version when the form opened; a stale one comes back as E00409. */
  version?: number;
};

export type UpdateAttributeActionOutput = {
  status: ActionStatus;
  /** Carries the version the update left the attribute at — the option save that follows needs it. */
  data?: AttributeUpdateResponse;
  errorMessage?: string;
};
