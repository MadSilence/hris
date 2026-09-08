import { useQuery } from "@tanstack/react-query";
import { getTimeOffAssignmentImpactQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffPolicyAssignmentsService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/services/timeOffPolicyAssignmentsService";

type Params = {
  policyId: string | null;
  userIds: string[];
};

/**
 * The warning that comes before assigning: who among these people has no approver the chain can
 * resolve to, and who has no hire date for an anniversary policy to anchor on.
 *
 * Idle until a policy is picked — there is nothing to ask about before that.
 */
export const useTimeOffAssignmentImpact = ({ policyId, userIds }: Params) => {
  return useQuery({
    queryKey: getTimeOffAssignmentImpactQueryKey(policyId ?? "", userIds),
    queryFn: () =>
      timeOffPolicyAssignmentsService.impact(policyId as string, userIds),
    enabled: Boolean(policyId) && userIds.length > 0,
    staleTime: 60 * 1000,
  });
};
