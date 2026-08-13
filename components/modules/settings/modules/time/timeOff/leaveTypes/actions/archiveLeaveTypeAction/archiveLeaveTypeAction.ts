"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisLeaveTypesService } from "@/api/modules/timeOff/leaveTypes/services";
import type { UpdateResponse } from "@/api/models/misc";

export const archiveLeaveTypeAction = async (
  submission: ArchiveLeaveTypeActionInput
): Promise<ArchiveLeaveTypeActionOutput> => {
  try {
    const data = await hrisLeaveTypesService.archive(submission.id);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("archiveLeaveTypeAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while archiving the leave type. Please try again.",
    };
  }
};

export type ArchiveLeaveTypeActionInput = { id: string };

export type ArchiveLeaveTypeActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
