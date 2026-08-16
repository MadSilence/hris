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
  } catch {
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
  sensitive?: boolean;
  decScale: number | null;
  hideYear: boolean;
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
};

export type CreateAttributeActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
