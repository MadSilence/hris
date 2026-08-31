"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { officeService } from "@/api/modules/office/services/officeService";
import { toActionError } from "@/lib/errors/withActionError";

export const deleteOfficeAction = async (
  submission: DeleteOfficeActionInput
): Promise<DeleteOfficeActionOutput> => {
  try {
    await officeService.deleteOffice(submission);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (error) {
    return toActionError(error, "deleteOfficeAction");
  }
};

export type DeleteOfficeActionInput = {
  id: string;
};

export type DeleteOfficeActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
