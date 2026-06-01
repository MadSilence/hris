"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyApprovalSettingsService } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/services";
import type { UpdateTimeOffPolicyApprovalSettingsRequest } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/dto";
import type { TimeOffPolicyApprovalSettings } from "@/models/timeOff";

export const updateTimeOffPolicyApprovalSettingsAction = async (
  submission: UpdateTimeOffPolicyApprovalSettingsActionInput
): Promise<UpdateTimeOffPolicyApprovalSettingsActionOutput> => {
  try {
    const { policyId, ...body } = submission;
    const data = await hrisTimeOffPolicyApprovalSettingsService.update(
      policyId,
      body
    );

    return {
      status: ActionStatus.SUCCESS,
      data,
    };
  } catch (error) {
    console.error("updateTimeOffPolicyApprovalSettingsAction error:", error);

    return {
      status: ActionStatus.ERROR,
      errorMessage:
        "An error occurred while updating the approval settings. Please try again.",
    };
  }
};

export type UpdateTimeOffPolicyApprovalSettingsActionInput = {
  policyId: string;
} & UpdateTimeOffPolicyApprovalSettingsRequest;

export type UpdateTimeOffPolicyApprovalSettingsActionOutput = {
  status: ActionStatus;
  data?: TimeOffPolicyApprovalSettings;
  errorMessage?: string;
};
