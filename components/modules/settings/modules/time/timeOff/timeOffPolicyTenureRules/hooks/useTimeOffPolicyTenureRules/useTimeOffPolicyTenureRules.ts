import { useQuery } from "@tanstack/react-query";
import { getTimeOffPolicyTenureRulesQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils/timeOffQueryKeys";
import { timeOffPolicyTenureRulesService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyTenureRules/services/timeOffPolicyTenureRulesService";

export const useTimeOffPolicyTenureRules = (policyId: string | undefined) => {
  return useQuery({
    queryKey: getTimeOffPolicyTenureRulesQueryKey(policyId ?? ""),
    queryFn: () => timeOffPolicyTenureRulesService.getByPolicyId(policyId as string),
    enabled: Boolean(policyId && policyId !== "undefined"),
  });
};
