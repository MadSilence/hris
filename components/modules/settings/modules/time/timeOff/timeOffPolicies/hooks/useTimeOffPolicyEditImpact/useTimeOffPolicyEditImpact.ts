import { useQuery } from "@tanstack/react-query";
import { getTimeOffPolicyEditImpactQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffPoliciesService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/services/timeOffPoliciesService";

/**
 * Asked while the editor is open, so the number is on screen before the save rather than after it.
 *
 * Not cached for long: somebody may file leave while the wizard is open, and a stale count is worse
 * than a fresh request.
 */
export const useTimeOffPolicyEditImpact = (policyId: string | null, enabled: boolean) => {
  return useQuery({
    queryKey: getTimeOffPolicyEditImpactQueryKey(policyId ?? ""),
    queryFn: () => timeOffPoliciesService.editImpact(policyId as string),
    enabled: Boolean(policyId) && enabled,
    staleTime: 30 * 1000,
  });
};
