import { hrisApiEmployeeTimeOffBalancesClient } from "@/api/modules/timeOff/employeeTimeOffBalances/clients";
import type {
  BalanceAsOfDTO,
  CreateEmployeeTimeOffBalanceRequest,
  AdjustEmployeeTimeOffBalanceRequest,
  EmployeeTimeOffBalanceTransactionDTO,
} from "@/api/modules/timeOff/employeeTimeOffBalances/dto";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import type { EmployeeTimeOffBalance } from "@/models/timeOff";

export class HrisEmployeeTimeOffBalancesService {
  public async create(
    body: CreateEmployeeTimeOffBalanceRequest
  ): Promise<CreateResponse> {
    return hrisApiEmployeeTimeOffBalancesClient.create(body);
  }

  public async getById(id: string): Promise<EmployeeTimeOffBalance> {
    return hrisApiEmployeeTimeOffBalancesClient.getById(id);
  }

  public async listByUserId(
    userId: string
  ): Promise<EmployeeTimeOffBalance[]> {
    return hrisApiEmployeeTimeOffBalancesClient.listByUserId(userId);
  }

  public async adjust(
    id: string,
    body: AdjustEmployeeTimeOffBalanceRequest
  ): Promise<UpdateResponse> {
    return hrisApiEmployeeTimeOffBalancesClient.adjust(id, body);
  }

  public async balanceAsOf(id: string, date: string): Promise<BalanceAsOfDTO> {
    return hrisApiEmployeeTimeOffBalancesClient.balanceAsOf(id, date);
  }

  public async listTransactions(
    id: string
  ): Promise<EmployeeTimeOffBalanceTransactionDTO[]> {
    return hrisApiEmployeeTimeOffBalancesClient.listTransactions(id);
  }
}

export const hrisEmployeeTimeOffBalancesService =
  new HrisEmployeeTimeOffBalancesService();
