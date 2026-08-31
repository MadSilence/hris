"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "approveTimeOffRequestAction");
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
