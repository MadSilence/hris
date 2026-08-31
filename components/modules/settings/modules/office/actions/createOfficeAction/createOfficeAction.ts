"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { officeService } from "@/api/modules/office/services/officeService";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

export const createOfficeAction = async (
  submission: CreateOfficeActionInput
): Promise<CreateOfficeActionOutput> => {
  try {
    const created = await officeService.createOffice(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: created,
    };
  } catch (error) {
    return toActionError(error, "createOfficeAction");
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

/**
 * The full envelope, not a narrowed copy of it: `toActionError` already returns `fieldErrors`, and
 * declaring only three of the fields is what hid them from every caller.
 */
export type CreateOfficeActionOutput = ActionResult<NewEntity>;
