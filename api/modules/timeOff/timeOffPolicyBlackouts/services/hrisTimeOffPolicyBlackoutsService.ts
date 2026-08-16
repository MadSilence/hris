import { hrisApiTimeOffPolicyBlackoutsClient } from "@/api/modules/timeOff/timeOffPolicyBlackouts/clients";
import type {
  TimeOffPolicyBlackoutDTO,
  UpdateTimeOffPolicyBlackoutsRequest,
} from "@/api/modules/timeOff/timeOffPolicyBlackouts/dto";
import type { UpdateResponse } from "@/api/models/misc";

export class HrisTimeOffPolicyBlackoutsService {
  public async getByPolicyId(policyId: string): Promise<TimeOffPolicyBlackoutDTO[]> {
    return hrisApiTimeOffPolicyBlackoutsClient.getByPolicyId(policyId);
  }

  public async update(
    policyId: string,
    body: UpdateTimeOffPolicyBlackoutsRequest
  ): Promise<UpdateResponse> {
    return hrisApiTimeOffPolicyBlackoutsClient.update(policyId, body);
  }
}

export const hrisTimeOffPolicyBlackoutsService =
  new HrisTimeOffPolicyBlackoutsService();
