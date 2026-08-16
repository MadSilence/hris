import { useQuery } from "@tanstack/react-query";
import { getTimeOffPolicyCoverageQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils/timeOffQueryKeys";
import { timeOffPolicyCoverageService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyCoverage/services/timeOffPolicyCoverageService";

export const useTimeOffPolicyCoverage = (policyId: string | undefined) => {
  return useQuery({
    queryKey: getTimeOffPolicyCoverageQueryKey(policyId ?? ""),
    queryFn: () => timeOffPolicyCoverageService.getByPolicyId(policyId as string),
    enabled: Boolean(policyId && policyId !== "undefined"),
  });
};
