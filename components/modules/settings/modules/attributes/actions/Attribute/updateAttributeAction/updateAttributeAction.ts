"use server"

import { attributeService } from "@/api/modules/attributes/services/attributeService";
import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { AttributeOption, AttributeType } from "@/models/attribute";

export const updateAttributeAction = async (
  submission: UpdateAttributeActionInput
): Promise<UpdateAttributeActionOutput> => {
  try {
    const data = await attributeService.updateAttribute(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: data,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while updating attribute. Please try again."
    };
  }
};

export type UpdateAttributeActionInput = {
  id: string;
  name?: string;
  type?: AttributeType;
  unique?: boolean;
  decScale?: number | null;
  dateHideYear?: boolean;
  options?: AttributeOption[];
};

export type UpdateAttributeActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
