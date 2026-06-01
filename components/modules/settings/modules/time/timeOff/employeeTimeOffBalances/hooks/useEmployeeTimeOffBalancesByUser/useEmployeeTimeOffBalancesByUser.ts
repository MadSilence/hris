import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assertTimeOffId,
  getEmployeeTimeOffBalancesByUserQueryKey,
  TIME_OFF_QUERY_KEY,
} from "@/components/modules/settings/modules/time/timeOff/utils";
import { employeeTimeOffBalancesService } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/services/employeeTimeOffBalancesService";

type UseEmployeeTimeOffBalancesByUserArgs = {
  userId: string;
};

export const useEmployeeTimeOffBalancesByUser = ({
  userId,
}: UseEmployeeTimeOffBalancesByUserArgs) => {
  return useQuery({
    queryKey: getEmployeeTimeOffBalancesByUserQueryKey(userId),
    queryFn: () => {
      assertTimeOffId(userId, "userId");
      return employeeTimeOffBalancesService.listByUserId(userId);
    },
    enabled: Boolean(userId && userId !== "undefined"),
  });
};

export const useInvalidateEmployeeTimeOffBalancesQuery = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({
      queryKey: [TIME_OFF_QUERY_KEY, "balances"],
    });
  };
};
