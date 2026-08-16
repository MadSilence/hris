import { hrisTimeOffPolicyCoverageService } from "@/api/modules/timeOff/timeOffPolicyCoverage/services";

export class TimeOffPolicyCoverageRoutes {
  public async getByPolicyId(_req: Request, policyId: string) {
    const data = await hrisTimeOffPolicyCoverageService.getByPolicyId(policyId);
    return Response.json(data);
  }
}

export const timeOffPolicyCoverageRoutes = new TimeOffPolicyCoverageRoutes();
