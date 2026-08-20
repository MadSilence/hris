"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisEmployeeTimeOffBalancesService } from "@/api/modules/timeOff/employeeTimeOffBalances/services";
import type { AdjustEmployeeTimeOffBalanceRequest } from "@/api/modules/timeOff/employeeTimeOffBalances/dto";
import type { UpdateResponse } from "@/api/models/misc";

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
    console.error("adjustEmployeeTimeOffBalanceAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while adjusting the time off balance. Please try again.",
    };
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
