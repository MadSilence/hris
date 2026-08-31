"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { legalEntityService } from "@/api/modules/legalEntity/services/legalEntityService";
import { toActionError, type ActionResult } from "@/lib/errors/withActionError";

export const createLegalEntityAction = async (
  submission: CreateLegalEntityActionInput
): Promise<CreateLegalEntityActionOutput> => {
  try {
    const created = await legalEntityService.createLegalEntity(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: created,
    };
  } catch (error) {
    return toActionError(error, "createLegalEntityAction");
  }
};

export type CreateLegalEntityActionInput = {
  name: string;
  description: string;
  registrationNumber: string;
  taxId: string;
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
export type CreateLegalEntityActionOutput = ActionResult<NewEntity>;
