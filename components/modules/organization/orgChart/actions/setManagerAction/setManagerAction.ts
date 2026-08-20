"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";

export type SetManagerActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};

export const setManagerAction = async (
  userId: string,
  managerId: string | null,
): Promise<SetManagerActionOutput> => {
  try {
    await hrisApiUsersService.setManager(userId, managerId);
    return { status: ActionStatus.SUCCESS };
  } catch (_error) {
    return {
      status: ActionStatus.ERROR,
      errorMessage: "Couldn't update the reporting line. Please try again.",
    };
  }
};
