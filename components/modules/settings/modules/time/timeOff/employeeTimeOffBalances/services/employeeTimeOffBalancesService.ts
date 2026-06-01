import type {
  EmployeeTimeOffBalance,
  EmployeeTimeOffBalanceAdjustment,
} from "@/models/timeOff";

export class EmployeeTimeOffBalancesService {
  public async getById(id: string): Promise<EmployeeTimeOffBalance> {
    const res = await fetch(`/api/time-off/balances/${id}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to load employee time off balance");
    }

    return res.json();
  }

  public async listByUserId(userId: string): Promise<EmployeeTimeOffBalance[]> {
    const res = await fetch(`/api/users/${userId}/time-off-balances`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to load employee time off balances");
    }

    return res.json();
  }

  public async listAdjustments(
    balanceId: string
  ): Promise<EmployeeTimeOffBalanceAdjustment[]> {
    const res = await fetch(
      `/api/time-off/balances/${balanceId}/adjustments`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to load employee time off balance adjustments");
    }

    return res.json();
  }
}

export const employeeTimeOffBalancesService =
  new EmployeeTimeOffBalancesService();
