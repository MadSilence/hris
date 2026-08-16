import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  updateTimeOffPolicyBlackoutsAction,
  type UpdateTimeOffPolicyBlackoutsActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyBlackouts/actions/updateTimeOffPolicyBlackoutsAction";

export const useUpdateTimeOffPolicyBlackouts = () => {
  return useMutation({
    mutationFn: async (payload: UpdateTimeOffPolicyBlackoutsActionInput) => {
      const result = await updateTimeOffPolicyBlackoutsAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to update blackout periods");
      }

      return result;
    },
  });
};
