import { internalApiClient } from "@/components/clients/apiClient";
import type {
  EmployeeTimeOffBalance,
  EmployeeTimeOffBalanceAdjustment,
} from "@/models/timeOff";

export class EmployeeTimeOffBalancesService {
  public async getById(id: string): Promise<EmployeeTimeOffBalance> {
    return internalApiClient.get<EmployeeTimeOffBalance>(`/time-off/balances/${id}`);
  }

  public async listByUserId(userId: string): Promise<EmployeeTimeOffBalance[]> {
    return internalApiClient.get<EmployeeTimeOffBalance[]>(`/users/${userId}/time-off-balances`);
  }

  public async listAdjustments(
    balanceId: string
  ): Promise<EmployeeTimeOffBalanceAdjustment[]> {
    return internalApiClient.get<EmployeeTimeOffBalanceAdjustment[]>(
      `/time-off/balances/${balanceId}/adjustments`,
    );
  }
}

export const employeeTimeOffBalancesService =
  new EmployeeTimeOffBalancesService();
