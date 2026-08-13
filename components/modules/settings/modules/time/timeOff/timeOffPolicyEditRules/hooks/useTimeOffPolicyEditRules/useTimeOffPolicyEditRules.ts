import { useQuery } from "@tanstack/react-query";
import { getTimeOffPolicyEditRulesQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffPolicyEditRulesService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyEditRules/services/timeOffPolicyEditRulesService";

export const useTimeOffPolicyEditRules = (policyId: string | undefined) => {
  return useQuery({
    queryKey: getTimeOffPolicyEditRulesQueryKey(policyId ?? ""),
    queryFn: () => timeOffPolicyEditRulesService.getByPolicyId(policyId as string),
    enabled: Boolean(policyId && policyId !== "undefined"),
  });
};
