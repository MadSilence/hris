import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTimeOffPoliciesQuery } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import {
  duplicateTimeOffPolicyAction,
  type DuplicateTimeOffPolicyActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/actions/duplicateTimeOffPolicyAction";

export const useDuplicateTimeOffPolicy = () => {
  const invalidateTimeOffPolicies = useInvalidateTimeOffPoliciesQuery();

  return useMutation({
    mutationFn: async (payload: DuplicateTimeOffPolicyActionInput) => {
      const result = await duplicateTimeOffPolicyAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to duplicate the policy");
      }

      return result;
    },
    onSuccess: () => {
      invalidateTimeOffPolicies();
    },
  });
};
