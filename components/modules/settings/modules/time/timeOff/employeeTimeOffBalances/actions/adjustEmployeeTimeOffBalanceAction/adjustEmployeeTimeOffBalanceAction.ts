"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisEmployeeTimeOffBalancesService } from "@/api/modules/timeOff/employeeTimeOffBalances/services";
import type { AdjustEmployeeTimeOffBalanceRequest } from "@/api/modules/timeOff/employeeTimeOffBalances/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const adjustEmployeeTimeOffBalanceAction = async (
  submission: AdjustEmployeeTimeOffBalanceActionInput
): Promise<AdjustEmployeeTimeOffBalanceActionOutput> => {
  try {
    const { balanceId, ...body } = submission;
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
