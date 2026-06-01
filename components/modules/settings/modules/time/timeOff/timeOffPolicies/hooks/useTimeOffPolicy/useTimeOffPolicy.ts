import { useQuery } from "@tanstack/react-query";
import {
  assertTimeOffId,
  getTimeOffPolicyQueryKey,
} from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffPoliciesService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/services/timeOffPoliciesService";

type UseTimeOffPolicyArgs = {
  policyId: string;
};

export const useTimeOffPolicy = ({ policyId }: UseTimeOffPolicyArgs) => {
  return useQuery({
    queryKey: getTimeOffPolicyQueryKey(policyId),
    queryFn: () => {
      assertTimeOffId(policyId, "policyId");
      return timeOffPoliciesService.getById(policyId);
    },
    enabled: Boolean(policyId && policyId !== "undefined"),
  });
};
