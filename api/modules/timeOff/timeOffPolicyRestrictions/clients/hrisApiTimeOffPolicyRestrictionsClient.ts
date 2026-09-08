import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  TimeOffPolicyRestrictionDTO,
  UpdateTimeOffPolicyRestrictionsRequest,
} from "@/api/modules/timeOff/timeOffPolicyRestrictions/dto";

export class HrisApiTimeOffPolicyRestrictionsClient {
  private readonly BASE_PATH = "/time-off/policies";

  public async listByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyRestrictionDTO[]> {
    return hrisApiClient.get<TimeOffPolicyRestrictionDTO[]>(
      `${this.BASE_PATH}/${policyId}/restrictions`
    );
  }

  public async replace(
    policyId: string,
    body: UpdateTimeOffPolicyRestrictionsRequest
  ): Promise<TimeOffPolicyRestrictionDTO[]> {
    return hrisApiClient.put<
      TimeOffPolicyRestrictionDTO[],
      UpdateTimeOffPolicyRestrictionsRequest
    >(`${this.BASE_PATH}/${policyId}/restrictions`, body);
  }
}

export const hrisApiTimeOffPolicyRestrictionsClient =
  new HrisApiTimeOffPolicyRestrictionsClient();
