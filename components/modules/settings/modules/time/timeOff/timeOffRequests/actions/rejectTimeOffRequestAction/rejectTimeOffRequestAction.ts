"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";
import type { RejectTimeOffRequestRequest } from "@/api/modules/timeOff/timeOffRequests/dto";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "rejectTimeOffRequestAction");
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
