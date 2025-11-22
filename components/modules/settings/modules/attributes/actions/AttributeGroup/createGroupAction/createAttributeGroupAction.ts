"use server"

import { groupsService } from "@/api/modules/groups/services/groupsService";
import { ActionStatus } from "@/components/models/ActionStatus";
import { NewEntity } from "@/models/misc";

export const createAttributeGroupAction = async (
  submission: CreateAttributeGroupActionInput
): Promise<CreateAttributeGroupActionOutput> => {
  try {
    const createEntity = await groupsService.createGroup(submission);

    return {
      status: ActionStatus.SUCCESS,
      data: createEntity,
    };
  } catch (e) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while creating a AttributeGroup. Please try again.",
    };
  }
};

export type CreateAttributeGroupActionInput = {
  name: string;
};

export type CreateAttributeGroupActionOutput = {
  status: ActionStatus;
  data?: NewEntity;
  errorMessage?: string;
};
