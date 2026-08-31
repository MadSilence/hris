"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisLeaveTypesService } from "@/api/modules/timeOff/leaveTypes/services";
import type { UpdateLeaveTypeRequest } from "@/api/modules/timeOff/leaveTypes/dto";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

export const updateLeaveTypeAction = async (
  submission: UpdateLeaveTypeActionInput
): Promise<UpdateLeaveTypeActionOutput> => {
  try {
    const { id, ...body } = submission;
    const data = await hrisLeaveTypesService.update(id, body);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "updateLeaveTypeAction");
  }
};

export type UpdateLeaveTypeActionInput = { id: string } & UpdateLeaveTypeRequest;

export type UpdateLeaveTypeActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
