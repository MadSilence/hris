"use server"

import { attributeService } from "@/api/modules/attributes/services/attributeService";
import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { AttributeOption, AttributeType } from "@/models/attribute";

export const createAttributeAction = async (
  submission: CreateAttributeActionInput
): Promise<CreateAttributeActionOutput> => {
  try {
    const createEntity = await attributeService.createAttribute(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: createEntity,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while creating an Attribute. Please try again.",
    };
  }
};

export type CreateAttributeActionInput = {
  name: string;
  groupId: string;
  type: AttributeType;
  isUnique: boolean;
  decScale: number | null;
  hideYear: boolean;
  options?: AttributeOption[];
};

export type CreateAttributeActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
