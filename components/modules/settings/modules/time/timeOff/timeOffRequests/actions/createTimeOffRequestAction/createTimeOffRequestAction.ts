"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";
import type { CreateTimeOffRequestRequest } from "@/api/modules/timeOff/timeOffRequests/dto";
import type { CreateResponse } from "@/api/models/misc";

export const createTimeOffRequestAction = async (
  submission: CreateTimeOffRequestActionInput
): Promise<CreateTimeOffRequestActionOutput> => {
  try {
    const data = await hrisTimeOffRequestsService.create(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("createTimeOffRequestAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while submitting the time off request. Please try again.",
    };
  }
};

export type CreateTimeOffRequestActionInput = CreateTimeOffRequestRequest;

export type CreateTimeOffRequestActionOutput = {
  status: ActionStatus;
  data?: CreateResponse;
  errorMessage?: string;
};
