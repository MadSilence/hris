"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { officeService } from "@/api/modules/office/services/officeService";

export const updateOfficeAction = async (
  submission: UpdateOfficeActionInput
): Promise<UpdateOfficeActionOutput> => {
  try {
    const updated = await officeService.updateOffice(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: updated,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating the office. Please try again.",
    };
  }
};

export type UpdateOfficeActionInput = {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  isSystem: boolean;
  country: string;
  city: string;
  street: string;
  building: string;
  postCode: string;
};

export type UpdateOfficeActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
