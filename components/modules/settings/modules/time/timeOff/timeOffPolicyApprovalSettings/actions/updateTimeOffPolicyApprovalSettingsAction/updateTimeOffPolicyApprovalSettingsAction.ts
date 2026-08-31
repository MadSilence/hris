"use server";

import { ActionStatus } from "@/components/models/ActionStatus";
import { hrisTimeOffPolicyApprovalSettingsService } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/services";
import type { UpdateTimeOffPolicyApprovalSettingsRequest } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/dto";
import type { UpdateResponse } from "@/api/models/misc";
import { toActionError } from "@/lib/errors/withActionError";

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
    return toActionError(error, "updateTimeOffPolicyApprovalSettingsAction");
  }
};

export type UpdateTimeOffPolicyApprovalSettingsActionInput = {
  policyId: string;
} & UpdateTimeOffPolicyApprovalSettingsRequest;

export type UpdateTimeOffPolicyApprovalSettingsActionOutput = {
  status: ActionStatus;
  data?: UpdateResponse;
  errorMessage?: string;
};
