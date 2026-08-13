import { useQuery } from "@tanstack/react-query";
import {
  assertTimeOffId,
  getEmployeeTimeOffBalanceTransactionsQueryKey,
} from "@/components/modules/settings/modules/time/timeOff/utils";
import { employeeTimeOffBalancesService } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/services/employeeTimeOffBalancesService";

type UseEmployeeTimeOffBalanceTransactionsArgs = {
  balanceId: string;
};

export const useEmployeeTimeOffBalanceTransactions = ({
  balanceId,
}: UseEmployeeTimeOffBalanceTransactionsArgs) => {
  return useQuery({
    queryKey: getEmployeeTimeOffBalanceTransactionsQueryKey(balanceId),
    queryFn: () => {
      assertTimeOffId(balanceId, "balanceId");
      return employeeTimeOffBalancesService.listTransactions(balanceId);
    },
    enabled: Boolean(balanceId && balanceId !== "undefined"),
  });
};
