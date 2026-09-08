import { internalApiClient } from "@/components/clients/apiClient";
import type { BalanceAsOfDTO } from "@/api/modules/timeOff/employeeTimeOffBalances/dto";
import type { EmployeeTimeOffBalance } from "@/models/timeOff";
import type { EmployeeTimeOffBalanceTransactionDTO } from "@/api/modules/timeOff/employeeTimeOffBalances/dto";

export class EmployeeTimeOffBalancesService {
  public async getById(id: string): Promise<EmployeeTimeOffBalance> {
    return internalApiClient.get<EmployeeTimeOffBalance>(`/time-off/balances/${id}`);
  }

  public async listByUserId(userId: string): Promise<EmployeeTimeOffBalance[]> {
    return internalApiClient.get<EmployeeTimeOffBalance[]>(`/users/${userId}/time-off-balances`);
  }

  public async listTransactions(
    balanceId: string
  ): Promise<EmployeeTimeOffBalanceTransactionDTO[]> {
    return internalApiClient.get<EmployeeTimeOffBalanceTransactionDTO[]>(
      `/time-off/balances/${balanceId}/transactions`,
    );
  }

  /** What this balance will hold on a date. The endpoint existed and had no caller. */
  public async balanceAsOf(id: string, date: string): Promise<BalanceAsOfDTO> {
    return internalApiClient.get<BalanceAsOfDTO>(
      `/time-off/balances/${id}/as-of?date=${date}`
    );
  }
}

export const employeeTimeOffBalancesService =
  new EmployeeTimeOffBalancesService();
