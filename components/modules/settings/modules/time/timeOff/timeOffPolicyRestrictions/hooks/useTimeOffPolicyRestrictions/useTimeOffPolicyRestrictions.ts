import { useQuery } from "@tanstack/react-query";
import { getTimeOffPolicyRestrictionsQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffPolicyRestrictionsService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyRestrictions/services";

/** Blackouts and coverage caps together — one query where there used to be two. */
export const useTimeOffPolicyRestrictions = (policyId: string | null) => {
  return useQuery({
    queryKey: getTimeOffPolicyRestrictionsQueryKey(policyId ?? ""),
    queryFn: () => timeOffPolicyRestrictionsService.listByPolicyId(policyId as string),
    enabled: Boolean(policyId),
  });
};
