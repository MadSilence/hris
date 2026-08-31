"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { officeService } from "@/api/modules/office/services/officeService";
import { toActionError } from "@/lib/errors/withActionError";

export const updateOfficeAction = async (
  submission: UpdateOfficeActionInput
): Promise<UpdateOfficeActionOutput> => {
  try {
    const updated = await officeService.updateOffice(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: updated,
    };
  } catch (error) {
    return toActionError(error, "updateOfficeAction");
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
