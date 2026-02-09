"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { officeService } from "@/api/modules/office/services/officeService";

export const deleteOfficeAction = async (
  submission: DeleteOfficeActionInput
): Promise<DeleteOfficeActionOutput> => {
  try {
    await officeService.deleteOffice(submission);

    return {
      status: ActionStatus.SUCCESS,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while deleting the office. Please try again.",
    };
  }
};

export type DeleteOfficeActionInput = {
  id: string;
};

export type DeleteOfficeActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
