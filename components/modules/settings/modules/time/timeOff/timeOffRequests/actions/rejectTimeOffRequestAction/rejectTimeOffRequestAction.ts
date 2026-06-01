"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";
import type { RejectTimeOffRequestRequest } from "@/api/modules/timeOff/timeOffRequests/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const rejectTimeOffRequestAction = async (
  submission: RejectTimeOffRequestActionInput
): Promise<RejectTimeOffRequestActionOutput> => {
  try {
    const { requestId, ...body } = submission;
    const data = await hrisTimeOffRequestsService.reject(requestId, body);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("rejectTimeOffRequestAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while rejecting the time off request. Please try again.",
    };
  }
};

export type RejectTimeOffRequestActionInput = {
  requestId: string;
} & RejectTimeOffRequestRequest;

export type RejectTimeOffRequestActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
