"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";
import { toActionError } from "@/lib/errors/withActionError";

export type UpdateUserAttributesActionInput = {
  userId: string;
  values: Record<string, unknown>;
};

export type UpdateUserAttributesActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};

export const updateUserAttributesAction = async (
  input: UpdateUserAttributesActionInput
): Promise<UpdateUserAttributesActionOutput> => {
  try {
    await hrisApiUsersService.updateUserAttributes(input.userId, input.values);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "updateUserAttributesAction");
  }
};
