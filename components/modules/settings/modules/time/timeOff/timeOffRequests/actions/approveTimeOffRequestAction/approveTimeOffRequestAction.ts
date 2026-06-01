"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";
import type { UpdateResponse } from "@/api/models/misc";

export const approveTimeOffRequestAction = async (
  submission: ApproveTimeOffRequestActionInput
): Promise<ApproveTimeOffRequestActionOutput> => {
  try {
    const data = await hrisTimeOffRequestsService.approve(submission.requestId);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("approveTimeOffRequestAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while approving the time off request. Please try again.",
    };
  }
};

export type ApproveTimeOffRequestActionInput = {
  requestId: string;
};

export type ApproveTimeOffRequestActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
