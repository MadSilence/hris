"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";

/**
 * Job & Employment writes that land on `POST /users/{id}/update` plus, when it changed, the
 * separate manager endpoint. Both are scope-checked server-side (`requireScopedOn`).
 */
export const updateUserAction = async (
  submission: UpdateUserActionInput
): Promise<UpdateUserActionOutput> => {
  try {
    const { userId, managerId, ...fields } = submission;

    const hasFieldChanges = Object.values(fields).some((v) => v !== undefined);
    if (hasFieldChanges) {
      await hrisApiUsersService.updateUser(userId, fields);
    }

    if (managerId !== undefined) {
      await hrisApiUsersService.setManager(userId, managerId);
    }

    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    console.error("updateUserAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage: "An error occurred while saving. Please try again.",
    };
  }
};

export type UpdateUserActionInput = {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  hireDate?: string;
  /** `undefined` = untouched, `null` = clear the manager. */
  managerId?: string | null;
};

export type UpdateUserActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};
