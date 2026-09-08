"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";
import type { EditTimeOffRequestRequest } from "@/api/modules/timeOff/timeOffRequests/dto";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

export const editTimeOffRequestAction = async (
  submission: EditTimeOffRequestActionInput
): Promise<EditTimeOffRequestActionOutput> => {
  try {
    // userId only rides along so the calling hook knows which cache to invalidate.
    const { requestId, userId: _userId, ...body } = submission;
    const data = await hrisTimeOffRequestsService.edit(requestId, body);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "editTimeOffRequestAction");
  }
};

export type EditTimeOffRequestActionInput = {
  requestId: string;
  userId: string;
} & EditTimeOffRequestRequest;

export type EditTimeOffRequestActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
