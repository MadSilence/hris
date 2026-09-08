import { useQuery } from "@tanstack/react-query";
import { getBalanceAsOfQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils";
import { employeeTimeOffBalancesService } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/services";

/**
 * "How many days will I have on this date?"
 *
 * The endpoint has existed since the balance ledger was built and nothing in the frontend called it,
 * so the answer was only available to somebody who could read the ledger and do the arithmetic.
 */
export const useBalanceAsOf = (balanceId: string | null, date: string) => {
  return useQuery({
    queryKey: getBalanceAsOfQueryKey(balanceId ?? "", date),
    queryFn: () =>
      employeeTimeOffBalancesService.balanceAsOf(balanceId as string, date),
    enabled: Boolean(balanceId) && Boolean(date),
    staleTime: 60 * 1000,
  });
};
