"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyCoverageService } from "@/api/modules/timeOff/timeOffPolicyCoverage/services";
import type { UpdateTimeOffPolicyCoverageRequest } from "@/api/modules/timeOff/timeOffPolicyCoverage/dto";
import type { UpdateResponse } from "@/api/models/misc";

export const updateTimeOffPolicyCoverageAction = async (
  submission: UpdateTimeOffPolicyCoverageActionInput
): Promise<UpdateTimeOffPolicyCoverageActionOutput> => {
  try {
    const { policyId, ...body } = submission;
    const data = await hrisTimeOffPolicyCoverageService.update(policyId, body);

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("updateTimeOffPolicyCoverageAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating coverage. Please try again.",
    };
  }
};

export type UpdateTimeOffPolicyCoverageActionInput = {
  policyId: string;
} & UpdateTimeOffPolicyCoverageRequest;

export type UpdateTimeOffPolicyCoverageActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
