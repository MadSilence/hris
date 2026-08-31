"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisEmployeeTimeOffBalancesService } from "@/api/modules/timeOff/employeeTimeOffBalances/services";
import type { AdjustEmployeeTimeOffBalanceRequest } from "@/api/modules/timeOff/employeeTimeOffBalances/dto";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

export const adjustEmployeeTimeOffBalanceAction = async (
  submission: AdjustEmployeeTimeOffBalanceActionInput
): Promise<AdjustEmployeeTimeOffBalanceActionOutput> => {
  try {
    // userId only rides along so the calling hook knows which cache to invalidate — it is not part of
    // the request, and forwarding it sent the backend a field its DTO does not declare.
    const { balanceId, userId: _userId, ...body } = submission;
    const data = await hrisEmployeeTimeOffBalancesService.adjust(
      balanceId,
      body
    );

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    return toActionError(error, "adjustEmployeeTimeOffBalanceAction");
  }
};

export type AdjustEmployeeTimeOffBalanceActionInput = {
  balanceId: string;
  userId: string;
} & AdjustEmployeeTimeOffBalanceRequest;

export type AdjustEmployeeTimeOffBalanceActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
