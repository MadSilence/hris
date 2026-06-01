import { useMutation } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTimeOffPoliciesQuery } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import {
  createTimeOffPolicyAction,
  type CreateTimeOffPolicyActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/actions/createTimeOffPolicyAction";

export const useCreateTimeOffPolicy = () => {
  const invalidateTimeOffPolicies = useInvalidateTimeOffPoliciesQuery();

  return useMutation({
    mutationFn: async (payload: CreateTimeOffPolicyActionInput) => {
      const result = await createTimeOffPolicyAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(
          result.errorMessage || "Failed to create time off policy"
        );
      }

      return result;
    },
    onSuccess: () => {
      invalidateTimeOffPolicies();
    },
  });
};
