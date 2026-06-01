import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTimeOffPoliciesQueryKey,
  TIME_OFF_QUERY_KEY,
} from "@/components/modules/settings/modules/time/timeOff/utils";
import { timeOffPoliciesService } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/services/timeOffPoliciesService";

export const useTimeOffPolicies = () => {
  return useQuery({
    queryKey: getTimeOffPoliciesQueryKey(),
    queryFn: () => timeOffPoliciesService.list(),
  });
};

export const useInvalidateTimeOffPoliciesQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({
      queryKey: [TIME_OFF_QUERY_KEY, "policies"],
    });
  };
};
