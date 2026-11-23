import { internalApiClient } from "@/components/clients/apiClient";
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
}

export const employeeTimeOffBalancesService =
  new EmployeeTimeOffBalancesService();
