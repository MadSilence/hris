"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { officeService } from "@/api/modules/office/services/officeService";

export const createOfficeAction = async (
  submission: CreateOfficeActionInput
): Promise<CreateOfficeActionOutput> => {
  try {
    const created = await officeService.createOffice(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: created,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating an office. Please try again.",
    };
  }
};

export type CreateOfficeActionInput = {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  country: string;
  city: string;
  street: string;
  building: string;
  postCode: string;
};

export type CreateOfficeActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
