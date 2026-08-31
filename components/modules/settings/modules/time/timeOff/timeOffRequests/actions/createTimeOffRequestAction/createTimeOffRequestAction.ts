"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";
import type { CreateTimeOffRequestRequest } from "@/api/modules/timeOff/timeOffRequests/dto";
import type { CreateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "createTimeOffRequestAction");
  }
};

export type CreateTimeOffRequestActionInput = CreateTimeOffRequestRequest;

export type CreateTimeOffRequestActionOutput = {
  status: ActionStatus;
  data?: CreateResponse;
  errorMessage?: string;
};
