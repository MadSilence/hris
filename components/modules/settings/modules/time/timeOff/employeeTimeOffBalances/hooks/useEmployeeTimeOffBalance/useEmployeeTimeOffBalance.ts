import { useQuery } from "@tanstack/react-query";
import {
  assertTimeOffId,
  getEmployeeTimeOffBalanceQueryKey,
} from "@/components/modules/settings/modules/time/timeOff/utils";
import { employeeTimeOffBalancesService } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/services/employeeTimeOffBalancesService";

type UseEmployeeTimeOffBalanceArgs = {
  balanceId: string;
};

export const useEmployeeTimeOffBalance = ({
  balanceId,
}: UseEmployeeTimeOffBalanceArgs) => {
  return useQuery({
    queryKey: getEmployeeTimeOffBalanceQueryKey(balanceId),
    queryFn: () => {
      assertTimeOffId(balanceId, "balanceId");
      return employeeTimeOffBalancesService.getById(balanceId);
    },
    enabled: Boolean(balanceId && balanceId !== "undefined"),
  });
};
