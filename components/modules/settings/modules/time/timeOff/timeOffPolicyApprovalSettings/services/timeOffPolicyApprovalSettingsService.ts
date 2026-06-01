import type { TimeOffPolicyApprovalSettings } from "@/models/timeOff";

export class TimeOffPolicyApprovalSettingsService {
  public async getByPolicyId(
    policyId: string
  ): Promise<TimeOffPolicyApprovalSettings> {
    const res = await fetch(
      `/api/time-off/policies/${policyId}/approval-settings`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to load time off policy approval settings");
    }

    return res.json();
  }
}

export const timeOffPolicyApprovalSettingsService =
  new TimeOffPolicyApprovalSettingsService();
