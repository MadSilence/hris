import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  TimeOffPolicyCoverageDTO,
  UpdateTimeOffPolicyCoverageRequest,
} from "@/api/modules/timeOff/timeOffPolicyCoverage/dto";
import type { UpdateResponse } from "@/api/models/misc";

export class HrisApiTimeOffPolicyCoverageClient {
  private readonly BASE_PATH = "/time-off/policies";

  public async getByPolicyId(policyId: string): Promise<TimeOffPolicyCoverageDTO> {
    return hrisApiClient.get<TimeOffPolicyCoverageDTO>(
      `${this.BASE_PATH}/${policyId}/coverage`
    );
  }

  public async update(
    policyId: string,
    body: UpdateTimeOffPolicyCoverageRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.put<UpdateResponse, UpdateTimeOffPolicyCoverageRequest>(
      `${this.BASE_PATH}/${policyId}/coverage`,
      body
    );
  }
}

export const hrisApiTimeOffPolicyCoverageClient =
  new HrisApiTimeOffPolicyCoverageClient();
