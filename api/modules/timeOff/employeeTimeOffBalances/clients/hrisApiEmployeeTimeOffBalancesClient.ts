import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  EmployeeTimeOffBalanceDTO,
  EmployeeTimeOffBalanceAdjustmentDTO,
  CreateEmployeeTimeOffBalanceRequest,
  AdjustEmployeeTimeOffBalanceRequest,
} from "@/api/modules/timeOff/employeeTimeOffBalances/dto";
import { employeeTimeOffBalanceMapper } from "@/api/modules/timeOff/employeeTimeOffBalances/mappers";
import { CreateResponse, UpdateResponse } from "@/api/models/misc";
import type {
  EmployeeTimeOffBalance,
  EmployeeTimeOffBalanceAdjustment,
} from "@/models/timeOff";

export class HrisApiEmployeeTimeOffBalancesClient {
  private readonly BALANCES_PATH = "/time-off/balances";
  private readonly USERS_PATH = "/users";

  public async create(
    body: CreateEmployeeTimeOffBalanceRequest
  ): Promise<CreateResponse> {
    return hrisApiClient.post<CreateResponse>(
      this.BALANCES_PATH,
      body as unknown as Record<string, unknown>
    );
  }

  public async getById(id: string): Promise<EmployeeTimeOffBalance> {
    const dto = await hrisApiClient.get<EmployeeTimeOffBalanceDTO>(
      `${this.BALANCES_PATH}/${id}`
    );

    return employeeTimeOffBalanceMapper.mapEmployeeTimeOffBalanceDTO(dto);
  }

  public async listByUserId(
    userId: string
  ): Promise<EmployeeTimeOffBalance[]> {
    const dtos = await hrisApiClient.get<EmployeeTimeOffBalanceDTO[]>(
      `${this.USERS_PATH}/${userId}/time-off-balances`
    );

    return employeeTimeOffBalanceMapper.mapEmployeeTimeOffBalanceDTOs(dtos);
  }

  public async adjust(
    id: string,
    body: AdjustEmployeeTimeOffBalanceRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.post<UpdateResponse>(
      `${this.BALANCES_PATH}/${id}/adjust`,
      body as unknown as Record<string, unknown>
    );
  }

  public async listAdjustments(
    id: string
  ): Promise<EmployeeTimeOffBalanceAdjustment[]> {
    const dtos = await hrisApiClient.get<EmployeeTimeOffBalanceAdjustmentDTO[]>(
      `${this.BALANCES_PATH}/${id}/adjustments`
    );

    return employeeTimeOffBalanceMapper.mapEmployeeTimeOffBalanceAdjustmentDTOs(
      dtos
    );
  }
}

export const hrisApiEmployeeTimeOffBalancesClient =
  new HrisApiEmployeeTimeOffBalancesClient();