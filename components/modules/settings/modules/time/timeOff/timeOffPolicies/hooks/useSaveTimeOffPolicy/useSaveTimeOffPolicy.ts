import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActionStatus } from "@/components/models/ActionStatus";
import { useInvalidateTimeOffPoliciesQuery } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { TIME_OFF_QUERY_KEY } from "@/components/modules/settings/modules/time/timeOff/utils";
import {
  saveTimeOffPolicyAction,
  type SaveTimeOffPolicyActionInput,
} from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/actions/saveTimeOffPolicyAction";

/**
 * One call for the whole policy, replacing ten in a row.
 *
 * It touches every section, so it invalidates the policy's whole subtree rather than naming each
 * query — the alternative is nine invalidations that drift apart from the nine payloads.
 */
export const useSaveTimeOffPolicy = () => {
  const invalidateTimeOffPolicies = useInvalidateTimeOffPoliciesQuery();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveTimeOffPolicyActionInput) => {
      const result = await saveTimeOffPolicyAction(payload);

      if (result.status === ActionStatus.ERROR) {
        throw new Error(result.errorMessage || "Failed to save the policy");
      }

      return result;
    },
    onSuccess: () => {
      invalidateTimeOffPolicies();
      void queryClient.invalidateQueries({ queryKey: [TIME_OFF_QUERY_KEY, "policies"] });
    },
  });
};
