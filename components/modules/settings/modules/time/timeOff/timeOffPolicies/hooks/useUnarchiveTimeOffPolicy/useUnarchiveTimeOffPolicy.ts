import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTimeOffPoliciesQuery } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import {
  unarchiveTimeOffPolicyAction,
  type UnarchiveTimeOffPolicyActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/actions/unarchiveTimeOffPolicyAction";

export const useUnarchiveTimeOffPolicy = () => {
  const invalidateTimeOffPolicies = useInvalidateTimeOffPoliciesQuery();

  return useMutation({
    mutationFn: async (payload: UnarchiveTimeOffPolicyActionInput) => {
      const result = await unarchiveTimeOffPolicyAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to unarchive time off policy");
      }

      return result;
    },
    onSuccess: () => {
      invalidateTimeOffPolicies();
    },
  });
};
