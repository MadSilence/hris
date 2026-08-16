import { hrisApiTimeOffPolicyEligibilityClient } from "@/api/modules/timeOff/timeOffPolicyEligibility/clients";
import type {
  TimeOffPolicyEligibilityDTO,
  UpdateTimeOffPolicyEligibilityRequest,
} from "@/api/modules/timeOff/timeOffPolicyEligibility/dto";
import type { UpdateResponse } from "@/api/models/misc";

export class HrisTimeOffPolicyEligibilityService {
  public async getByPolicyId(policyId: string): Promise<TimeOffPolicyEligibilityDTO> {
    return hrisApiTimeOffPolicyEligibilityClient.getByPolicyId(policyId);
  }

  public async update(
    policyId: string,
    body: UpdateTimeOffPolicyEligibilityRequest
  ): Promise<UpdateResponse> {
    return hrisApiTimeOffPolicyEligibilityClient.update(policyId, body);
  }
}

export const hrisTimeOffPolicyEligibilityService =
  new HrisTimeOffPolicyEligibilityService();
