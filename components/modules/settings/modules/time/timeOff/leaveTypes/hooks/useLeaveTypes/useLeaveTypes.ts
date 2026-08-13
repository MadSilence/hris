import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLeaveTypesQueryKey,
  TIME_OFF_QUERY_KEY,
} from "@/components/modules/settings/modules/time/timeOff/utils";
import { leaveTypesService } from "@/components/modules/settings/modules/time/timeOff/leaveTypes/services/leaveTypesService";

export const useLeaveTypes = () => {
  return useQuery({
    queryKey: getLeaveTypesQueryKey(),
    queryFn: () => leaveTypesService.list(),
  });
};

export const useInvalidateLeaveTypesQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({
      queryKey: [TIME_OFF_QUERY_KEY, "leaveTypes"],
    });
  };
};
