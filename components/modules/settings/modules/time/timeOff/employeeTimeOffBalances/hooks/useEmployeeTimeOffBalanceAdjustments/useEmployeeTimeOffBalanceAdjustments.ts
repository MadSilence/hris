import { useQuery } from "@tanstack/react-query";
import {
  assertTimeOffId,
  getEmployeeTimeOffBalanceAdjustmentsQueryKey,
} from "@/components/modules/settings/modules/time/timeOff/utils";
import { employeeTimeOffBalancesService } from "@/components/modules/settings/modules/time/timeOff/employeeTimeOffBalances/services/employeeTimeOffBalancesService";

type UseEmployeeTimeOffBalanceAdjustmentsArgs = {
  balanceId: string;
};

export const useEmployeeTimeOffBalanceAdjustments = ({
  balanceId,
}: UseEmployeeTimeOffBalanceAdjustmentsArgs) => {
  return useQuery({
    queryKey: getEmployeeTimeOffBalanceAdjustmentsQueryKey(balanceId),
    queryFn: () => {
      assertTimeOffId(balanceId, "balanceId");
      return employeeTimeOffBalancesService.listAdjustments(balanceId);
    },
    enabled: Boolean(balanceId && balanceId !== "undefined"),
  });
};
