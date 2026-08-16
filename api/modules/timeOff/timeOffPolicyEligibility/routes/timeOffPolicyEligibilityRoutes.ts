import { hrisTimeOffPolicyEligibilityService } from "@/api/modules/timeOff/timeOffPolicyEligibility/services";

export class TimeOffPolicyEligibilityRoutes {
  public async getByPolicyId(_req: Request, policyId: string) {
    const data = await hrisTimeOffPolicyEligibilityService.getByPolicyId(policyId);
    return Response.json(data);
  }
}

export const timeOffPolicyEligibilityRoutes =
  new TimeOffPolicyEligibilityRoutes();
