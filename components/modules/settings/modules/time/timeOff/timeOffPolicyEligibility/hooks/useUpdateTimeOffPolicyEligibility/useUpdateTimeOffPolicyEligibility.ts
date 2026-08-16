import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  updateTimeOffPolicyEligibilityAction,
  type UpdateTimeOffPolicyEligibilityActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyEligibility/actions/updateTimeOffPolicyEligibilityAction";

export const useUpdateTimeOffPolicyEligibility = () => {
  return useMutation({
    mutationFn: async (payload: UpdateTimeOffPolicyEligibilityActionInput) => {
      const result = await updateTimeOffPolicyEligibilityAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to update eligibility");
      }

      return result;
    },
  });
};
