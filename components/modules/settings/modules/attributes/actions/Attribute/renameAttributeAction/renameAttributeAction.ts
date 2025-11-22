"use server"

import { attributeService } from "@/api/modules/attributes/services/attributeService";
import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";

export const renameAttributeAction = async (
  submission: RenameAttributeActionInput
): Promise<RenameAttributeActionOutput> => {
  try {
    const data = await attributeService.renameAttribute(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: data
    }
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while renaming attribute. Please try again later."
    };
  }
};

export type RenameAttributeActionInput = {
  id: string;
  name: string;
};

export type RenameAttributeActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
