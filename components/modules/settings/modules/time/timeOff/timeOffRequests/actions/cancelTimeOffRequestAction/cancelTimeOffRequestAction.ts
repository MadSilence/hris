"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";
import type { CancelTimeOffRequestRequest } from "@/api/modules/timeOff/timeOffRequests/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const cancelTimeOffRequestAction = async (
  submission: CancelTimeOffRequestActionInput
): Promise<CancelTimeOffRequestActionOutput> => {
  try {
    // userId only rides along so the calling hook knows which cache to invalidate.
    const { requestId, userId: _userId, ...body } = submission;
    const data = await hrisTimeOffRequestsService.cancel(requestId, body);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("cancelTimeOffRequestAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while cancelling the time off request. Please try again.",
    };
  }
};

export type CancelTimeOffRequestActionInput = {
  requestId: string;
  userId: string;
} & CancelTimeOffRequestRequest;

export type CancelTimeOffRequestActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
