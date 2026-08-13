import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  updateTimeOffPolicyRequestRulesAction,
  type UpdateTimeOffPolicyRequestRulesActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyRequestRules/actions/updateTimeOffPolicyRequestRulesAction";

export const useUpdateTimeOffPolicyRequestRules = () => {
  return useMutation({
    mutationFn: async (payload: UpdateTimeOffPolicyRequestRulesActionInput) => {
      const result = await updateTimeOffPolicyRequestRulesAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to update request rules");
      }

      return result;
    },
  });
};
