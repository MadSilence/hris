"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisApiUsersService } from "@/api/modules/users/services/hrisUsersService";
import { toActionError } from "@/lib/errors/withActionError";

export type InsertManagerAboveActionOutput = {
  status: ActionStatus;
  errorMessage?: string;
};

/** `managerId` takes the person's place under their manager, and the person then reports to them. */
export const insertManagerAboveAction = async (
  userId: string,
  managerId: string,
): Promise<InsertManagerAboveActionOutput> => {
  try {
    await hrisApiUsersService.insertManagerAbove(userId, managerId);
    return { status: ActionStatus.SUCCESS };
  } catch (error) {
    return toActionError(error, "insertManagerAboveAction");
  }
};
