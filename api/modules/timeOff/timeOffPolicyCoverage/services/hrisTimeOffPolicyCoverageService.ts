import { hrisApiTimeOffPolicyCoverageClient } from "@/api/modules/timeOff/timeOffPolicyCoverage/clients";
import type {
  TimeOffPolicyCoverageDTO,
  UpdateTimeOffPolicyCoverageRequest,
} from "@/api/modules/timeOff/timeOffPolicyCoverage/dto";
import type { UpdateResponse } from "@/api/models/misc";

export class HrisTimeOffPolicyCoverageService {
  public async getByPolicyId(policyId: string): Promise<TimeOffPolicyCoverageDTO> {
    return hrisApiTimeOffPolicyCoverageClient.getByPolicyId(policyId);
  }

  public async update(
    policyId: string,
    body: UpdateTimeOffPolicyCoverageRequest
  ): Promise<UpdateResponse> {
    return hrisApiTimeOffPolicyCoverageClient.update(policyId, body);
  }
}

export const hrisTimeOffPolicyCoverageService =
  new HrisTimeOffPolicyCoverageService();
