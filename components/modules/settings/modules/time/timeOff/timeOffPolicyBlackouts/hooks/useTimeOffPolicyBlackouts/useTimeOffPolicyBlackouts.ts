import { useQuery } from "@tanstack/react-query";
import { getTimeOffPolicyBlackoutsQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils/timeOffQueryKeys";
import { timeOffPolicyBlackoutsService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyBlackouts/services/timeOffPolicyBlackoutsService";

export const useTimeOffPolicyBlackouts = (policyId: string | undefined) => {
  return useQuery({
    queryKey: getTimeOffPolicyBlackoutsQueryKey(policyId ?? ""),
    queryFn: () => timeOffPolicyBlackoutsService.getByPolicyId(policyId as string),
    enabled: Boolean(policyId && policyId !== "undefined"),
  });
};
