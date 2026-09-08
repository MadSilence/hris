import { hrisTimeOffPolicyRestrictionsService } from "@/api/modules/timeOff/timeOffPolicyRestrictions/services";

export class TimeOffPolicyRestrictionsRoutes {
  public async listByPolicyId(_req: Request, policyId: string) {
    const data =
      await hrisTimeOffPolicyRestrictionsService.listByPolicyId(policyId);
    return Response.json(data);
  }
}

export const timeOffPolicyRestrictionsRoutes =
  new TimeOffPolicyRestrictionsRoutes();
