import { useQuery } from "@tanstack/react-query";
import { getTimeOffPolicyAccrualQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils/timeOffQueryKeys";
import { timeOffPolicyAccrualService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAccrual/services/timeOffPolicyAccrualService";

export const useTimeOffPolicyAccrual = (policyId: string | undefined) => {
  return useQuery({
    queryKey: getTimeOffPolicyAccrualQueryKey(policyId ?? ""),
    queryFn: () => timeOffPolicyAccrualService.getByPolicyId(policyId as string),
    enabled: Boolean(policyId && policyId !== "undefined"),
  });
};
