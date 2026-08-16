import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  TimeOffPolicyEligibilityDTO,
  UpdateTimeOffPolicyEligibilityRequest,
} from "@/api/modules/timeOff/timeOffPolicyEligibility/dto";
import type { UpdateResponse } from "@/api/models/misc";

export class HrisApiTimeOffPolicyEligibilityClient {
  private readonly BASE_PATH = "/time-off/policies";

  public async getByPolicyId(policyId: string): Promise<TimeOffPolicyEligibilityDTO> {
    return hrisApiClient.get<TimeOffPolicyEligibilityDTO>(
      `${this.BASE_PATH}/${policyId}/eligibility`
    );
  }

  public async update(
    policyId: string,
    body: UpdateTimeOffPolicyEligibilityRequest
  ): Promise<UpdateResponse> {
    return hrisApiClient.put<UpdateResponse, UpdateTimeOffPolicyEligibilityRequest>(
      `${this.BASE_PATH}/${policyId}/eligibility`,
      body
    );
  }
}

export const hrisApiTimeOffPolicyEligibilityClient =
  new HrisApiTimeOffPolicyEligibilityClient();
