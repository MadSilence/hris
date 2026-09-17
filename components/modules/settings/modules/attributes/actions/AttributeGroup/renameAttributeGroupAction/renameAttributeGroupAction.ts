"use server"

import { ActionStatus } from "@/components/models/ActionStatus";
import { UpdatedEntity } from "@/models/misc";
import { groupsService } from "@/api/modules/groups/services/groupsService";
import { toActionError } from "@/lib/errors/withActionError";

export async function renameAttributeGroupAction(
  submission: RenameAttributeGroupActionInput
): Promise<RenameAttributeGroupActionOutput> {
  try {
    const data = await groupsService.renameAttributeGroup(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: data
    }
  } catch (error) {
    return toActionError(error, "renameAttributeGroupAction");
  }
}

export type RenameAttributeGroupActionInput = {
  id: string;
  name: string;
  /** Replaced, not patched — an empty or missing description clears the stored one. */
  description?: string | null;
  /** The group's version when the form opened; a stale one comes back as E00409. */
  version?: number;
};

export type RenameAttributeGroupActionOutput = {
  status: ActionStatus;
  data?: UpdatedEntity;
  errorMessage?: string;
};
