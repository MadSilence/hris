"use server"

import { attributeService } from "@/api/modules/attributes/services/attributeService";
import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { AttributeOption, AttributeType } from "@/models/attribute";
import { toActionError } from "@/lib/errors/withActionError";

export const updateAttributeAction = async (
  submission: UpdateAttributeActionInput
): Promise<UpdateAttributeActionOutput> => {
  try {
    const data = await attributeService.updateAttribute(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: data,
    };
  } catch (error) {
    return toActionError(error, "updateAttributeAction");
  }
};

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
};

export type UpdateAttributeActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
