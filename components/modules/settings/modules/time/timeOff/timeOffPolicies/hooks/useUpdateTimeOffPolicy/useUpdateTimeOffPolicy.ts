import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTimeOffPoliciesQuery } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import {
  updateTimeOffPolicyAction,
  type UpdateTimeOffPolicyActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/actions/updateTimeOffPolicyAction";

export const useUpdateTimeOffPolicy = () => {
  const invalidateTimeOffPolicies = useInvalidateTimeOffPoliciesQuery();

  return useMutation({
    mutationFn: async (payload: UpdateTimeOffPolicyActionInput) => {
      const result = await updateTimeOffPolicyAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(
          result.errorMessage || "Failed to update time off policy"
        );
      }

      return result;
    },
    onSuccess: () => {
      invalidateTimeOffPolicies();
    },
  });
};
