import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  updateTimeOffPolicyAccrualAction,
  type UpdateTimeOffPolicyAccrualActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAccrual/actions/updateTimeOffPolicyAccrualAction";

export const useUpdateTimeOffPolicyAccrual = () => {
  return useMutation({
    mutationFn: async (payload: UpdateTimeOffPolicyAccrualActionInput) => {
      const result = await updateTimeOffPolicyAccrualAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to update accrual");
      }

      return result;
    },
  });
};
