import { useQuery } from "@tanstack/react-query";
import { getTimeOffPolicyRequestRulesQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffPolicyRequestRulesService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyRequestRules/services/timeOffPolicyRequestRulesService";

export const useTimeOffPolicyRequestRules = (policyId: string | undefined) => {
  return useQuery({
    queryKey: getTimeOffPolicyRequestRulesQueryKey(policyId ?? ""),
    queryFn: () => timeOffPolicyRequestRulesService.getByPolicyId(policyId as string),
    enabled: Boolean(policyId && policyId !== "undefined"),
  });
};
