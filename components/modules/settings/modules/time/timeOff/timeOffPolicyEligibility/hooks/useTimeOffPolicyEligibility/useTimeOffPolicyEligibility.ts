import { useQuery } from "@tanstack/react-query";
import { getTimeOffPolicyEligibilityQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils/timeOffQueryKeys";
import { timeOffPolicyEligibilityService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyEligibility/services/timeOffPolicyEligibilityService";

export const useTimeOffPolicyEligibility = (policyId: string | undefined) => {
  return useQuery({
    queryKey: getTimeOffPolicyEligibilityQueryKey(policyId ?? ""),
    queryFn: () => timeOffPolicyEligibilityService.getByPolicyId(policyId as string),
    enabled: Boolean(policyId && policyId !== "undefined"),
  });
};
