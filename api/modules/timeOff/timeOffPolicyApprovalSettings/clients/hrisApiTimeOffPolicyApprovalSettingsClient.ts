import { hrisApiClient } from "@/api/clients/hrisApiClient/hrisApiClient";
import type {
  TimeOffPolicyApprovalSettingsDTO,
  UpdateTimeOffPolicyApprovalSettingsRequest,
} from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/dto";
import { timeOffPolicyApprovalSettingsMapper } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/mappers";
import type { TimeOffPolicyApprovalSettings } from "@/models/timeOff";

export class HrisApiTimeOffPolicyApprovalSettingsClient {
  private readonly BASE_PATH = "/api/time-off/policies";

  public async getByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyApprovalSettings> {
    const dto = await hrisApiClient.get<TimeOffPolicyApprovalSettingsDTO>(
      `${this.BASE_PATH}/${policyId}/approval-settings`
    );

    return timeOffPolicyApprovalSettingsMapper.mapTimeOffPolicyApprovalSettingsDTO(
      dto
    );
  }

  public async update(
    policyId: string,
    body: UpdateTimeOffPolicyApprovalSettingsRequest
  ): Promise<TimeOffPolicyApprovalSettings> {
    const dto = await hrisApiClient.put<
      TimeOffPolicyApprovalSettingsDTO,
      UpdateTimeOffPolicyApprovalSettingsRequest
    >(`${this.BASE_PATH}/${policyId}/approval-settings`, body);

    return timeOffPolicyApprovalSettingsMapper.mapTimeOffPolicyApprovalSettingsDTO(
      dto
    );
  }
}

export const hrisApiTimeOffPolicyApprovalSettingsClient =
  new HrisApiTimeOffPolicyApprovalSettingsClient();