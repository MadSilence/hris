import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assertTimeOffId,
  getTimeOffPolicyAssignmentsQueryKey,
} from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffPolicyAssignmentsService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/services/timeOffPolicyAssignmentsService";

type UseTimeOffPolicyAssignmentsArgs = {
  policyId: string;
};

export const useTimeOffPolicyAssignments = ({
  policyId,
}: UseTimeOffPolicyAssignmentsArgs) => {
  return useQuery({
    queryKey: getTimeOffPolicyAssignmentsQueryKey(policyId),
    queryFn: () => {
      assertTimeOffId(policyId, "policyId");
      return timeOffPolicyAssignmentsService.listByPolicyId(policyId);
    },
    enabled: Boolean(policyId && policyId !== "undefined"),
  });
};

export const useInvalidateTimeOffPolicyAssignmentsQuery = () => {
  const queryClient = useQueryClient();

  return (policyId: string) => {
    void queryClient.invalidateQueries({
      queryKey: getTimeOffPolicyAssignmentsQueryKey(policyId),
    });
  };
};
