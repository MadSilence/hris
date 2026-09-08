"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisLeaveTypesService } from "@/api/modules/timeOff/leaveTypes/services";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

/**
 * Bring an archived leave type back.
 *
 * Without it a type archived by mistake could be neither restored nor deleted, and the only way back
 * was a database row.
 */
export const restoreLeaveTypeAction = async (
  submission: RestoreLeaveTypeActionInput
): Promise<RestoreLeaveTypeActionOutput> => {
  try {
    const data = await hrisLeaveTypesService.restore(submission.id);

    return { status: ActionStatus.SUCCESS, data };
  } catch (error) {
    return toActionError(error, "restoreLeaveTypeAction");
  }
};

export type RestoreLeaveTypeActionInput = { id: string };

export type RestoreLeaveTypeActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
