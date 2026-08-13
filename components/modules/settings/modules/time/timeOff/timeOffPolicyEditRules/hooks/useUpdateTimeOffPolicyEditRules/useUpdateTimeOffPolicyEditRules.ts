import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  updateTimeOffPolicyEditRulesAction,
  type UpdateTimeOffPolicyEditRulesActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyEditRules/actions/updateTimeOffPolicyEditRulesAction";

export const useUpdateTimeOffPolicyEditRules = () => {
  return useMutation({
    mutationFn: async (payload: UpdateTimeOffPolicyEditRulesActionInput) => {
      const result = await updateTimeOffPolicyEditRulesAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to update edit rules");
      }

      return result;
    },
  });
};
