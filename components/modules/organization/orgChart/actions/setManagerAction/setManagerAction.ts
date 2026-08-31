"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";
import { toActionError } from "@/lib/errors/withActionError";

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
  } catch (error) {
    return toActionError(error, "setManagerAction");
  }
};
