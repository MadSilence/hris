"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisEmployeeTimeOffBalancesService } from "@/api/modules/timeOff/employeeTimeOffBalances/services";
import type { CreateEmployeeTimeOffBalanceRequest } from "@/api/modules/timeOff/employeeTimeOffBalances/dto";
import type { CreateResponse } from "@/api/models/misc";

export const createEmployeeTimeOffBalanceAction = async (
  submission: CreateEmployeeTimeOffBalanceActionInput
): Promise<CreateEmployeeTimeOffBalanceActionOutput> => {
  try {
    const data = await hrisEmployeeTimeOffBalancesService.create(submission);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("createEmployeeTimeOffBalanceAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while creating the time off balance. Please try again.",
    };
  }
};

export type CreateEmployeeTimeOffBalanceActionInput =
  CreateEmployeeTimeOffBalanceRequest;

export type CreateEmployeeTimeOffBalanceActionOutput = {
  status: ActionStatus;
  data?: CreateResponse;
  errorMessage?: string;
};
