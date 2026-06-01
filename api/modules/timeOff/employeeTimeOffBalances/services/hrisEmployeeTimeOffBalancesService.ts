import { hrisApiEmployeeTimeOffBalancesClient } from "@/api/modules/timeOff/employeeTimeOffBalances/clients";
import type {
  CreateEmployeeTimeOffBalanceRequest,
  AdjustEmployeeTimeOffBalanceRequest,
} from "@/api/modules/timeOff/employeeTimeOffBalances/dto";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import type {
  EmployeeTimeOffBalance,
  EmployeeTimeOffBalanceAdjustment,
} from "@/models/timeOff";

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

  public async listAdjustments(
    id: string
  ): Promise<EmployeeTimeOffBalanceAdjustment[]> {
    return hrisApiEmployeeTimeOffBalancesClient.listAdjustments(id);
  }
}

export const hrisEmployeeTimeOffBalancesService =
  new HrisEmployeeTimeOffBalancesService();