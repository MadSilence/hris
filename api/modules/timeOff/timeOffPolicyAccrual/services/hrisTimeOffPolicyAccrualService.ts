import { hrisApiTimeOffPolicyAccrualClient } from "@/api/modules/timeOff/timeOffPolicyAccrual/clients";
import type {
  TimeOffPolicyAccrualDTO,
  UpdateTimeOffPolicyAccrualRequest,
} from "@/api/modules/timeOff/timeOffPolicyAccrual/dto";
import type { UpdateResponse } from "@/api/models/misc";

export class HrisTimeOffPolicyAccrualService {
  public async getByPolicyId(policyId: string): Promise<TimeOffPolicyAccrualDTO> {
    return hrisApiTimeOffPolicyAccrualClient.getByPolicyId(policyId);
  }

  public async update(
    policyId: string,
    body: UpdateTimeOffPolicyAccrualRequest
  ): Promise<UpdateResponse> {
    return hrisApiTimeOffPolicyAccrualClient.update(policyId, body);
  }
}

export const hrisTimeOffPolicyAccrualService =
  new HrisTimeOffPolicyAccrualService();
