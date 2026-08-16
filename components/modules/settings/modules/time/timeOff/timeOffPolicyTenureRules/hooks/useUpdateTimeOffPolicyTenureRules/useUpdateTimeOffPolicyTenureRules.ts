import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  updateTimeOffPolicyTenureRulesAction,
  type UpdateTimeOffPolicyTenureRulesActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyTenureRules/actions/updateTimeOffPolicyTenureRulesAction";

export const useUpdateTimeOffPolicyTenureRules = () => {
  return useMutation({
    mutationFn: async (payload: UpdateTimeOffPolicyTenureRulesActionInput) => {
      const result = await updateTimeOffPolicyTenureRulesAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to update tenure rewards");
      }

      return result;
    },
  });
};
