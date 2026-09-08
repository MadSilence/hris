import { hrisApiTimeOffPolicyRestrictionsClient } from "@/api/modules/timeOff/timeOffPolicyRestrictions/clients";
import type {
  TimeOffPolicyRestrictionDTO,
  UpdateTimeOffPolicyRestrictionsRequest,
} from "@/api/modules/timeOff/timeOffPolicyRestrictions/dto";

export class HrisTimeOffPolicyRestrictionsService {
  public async listByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyRestrictionDTO[]> {
    return hrisApiTimeOffPolicyRestrictionsClient.listByPolicyId(policyId);
  }

  public async replace(
    policyId: string,
    body: UpdateTimeOffPolicyRestrictionsRequest
  ): Promise<TimeOffPolicyRestrictionDTO[]> {
    return hrisApiTimeOffPolicyRestrictionsClient.replace(policyId, body);
  }
}

export const hrisTimeOffPolicyRestrictionsService =
  new HrisTimeOffPolicyRestrictionsService();
