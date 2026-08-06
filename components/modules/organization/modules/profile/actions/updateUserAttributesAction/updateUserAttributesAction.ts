"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";

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
    console.error("updateUserAttributesAction error:", error);
    return {
      status: ActionStatus.ERROR,
      errorMessage: "Failed to save changes. Please try again.",
    };
  }
};
