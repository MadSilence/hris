"use server"

import { attributeService } from "@/api/modules/attributes/services/attributeService";
import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";
import { ActionResult, toActionError } from "@/lib/errors/withActionError";

/** Copies an attribute's definition and options into the same section. Values are never copied. */
export async function duplicateAttributeAction(
  submission: DuplicateAttributeActionInput
): Promise<DuplicateAttributeActionOutput> {
  try {
    const data = await attributeService.duplicateAttribute(submission.id, submission.name);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "duplicateAttributeAction");
  }
}

export type DuplicateAttributeActionInput = {
  id: string;
  /** Omitted: the backend names the copy "<source> (copy)", numbered if that is taken. */
  name?: string;
};

export type DuplicateAttributeActionOutput = ActionResult<NewEntity>;
