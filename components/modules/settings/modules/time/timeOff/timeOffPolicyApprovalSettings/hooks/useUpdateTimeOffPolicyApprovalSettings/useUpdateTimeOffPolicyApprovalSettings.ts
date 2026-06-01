import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTimeOffPolicyApprovalSettingsQuery } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyApprovalSettings/hooks/useTimeOffPolicyApprovalSettings";
import {
  updateTimeOffPolicyApprovalSettingsAction,
  type UpdateTimeOffPolicyApprovalSettingsActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyApprovalSettings/actions/updateTimeOffPolicyApprovalSettingsAction";

export const useUpdateTimeOffPolicyApprovalSettings = () => {
  const invalidateApprovalSettings =
    useInvalidateTimeOffPolicyApprovalSettingsQuery();

  return useMutation({
    mutationFn: async (
      payload: UpdateTimeOffPolicyApprovalSettingsActionInput
    ) => {
      const result = await updateTimeOffPolicyApprovalSettingsAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(
          result.errorMessage || "Failed to update approval settings"
        );
      }

      return result;
    },
    onSuccess: (_, variables) => {
      invalidateApprovalSettings(variables.policyId);
    },
  });
};
