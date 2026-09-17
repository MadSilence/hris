import { hrisTimeOffPolicyApprovalSettingsService } from "@/api/modules/timeOff/timeOffPolicyApprovalSettings/services";

// Mutations go through server actions; reads go through these methods only where a route handler exists.
export class TimeOffPolicyApprovalSettingsRoutes {
  public async getByPolicyId(_req: Request, policyId: string) {
    const data =
      await hrisTimeOffPolicyApprovalSettingsService.getByPolicyId(policyId);
    return Response.json(data);
  }
}

export const timeOffPolicyApprovalSettingsRoutes =
  new TimeOffPolicyApprovalSettingsRoutes();