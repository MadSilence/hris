"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisLeaveTypesService } from "@/api/modules/timeOff/leaveTypes/services";
import type { CreateLeaveTypeRequest } from "@/api/modules/timeOff/leaveTypes/dto";
import type { CreateResponse } from "@/api/models/misc";

export const createLeaveTypeAction = async (
  submission: CreateLeaveTypeActionInput
): Promise<CreateLeaveTypeActionOutput> => {
  try {
    const data = await hrisLeaveTypesService.create(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("createLeaveTypeAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating the leave type. Please try again.",
    };
  }
};

export type CreateLeaveTypeActionInput = CreateLeaveTypeRequest;

export type CreateLeaveTypeActionOutput = {
  status: ActionStatus;
  data?: CreateResponse;
  errorMessage?: string;
};
