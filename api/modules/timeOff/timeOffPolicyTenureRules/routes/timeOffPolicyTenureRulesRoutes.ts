import { hrisTimeOffPolicyTenureRulesService } from "@/api/modules/timeOff/timeOffPolicyTenureRules/services";

export class TimeOffPolicyTenureRulesRoutes {
  public async getByPolicyId(_req: Request, policyId: string) {
    const data = await hrisTimeOffPolicyTenureRulesService.getByPolicyId(policyId);
    return Response.json(data);
  }
}

export const timeOffPolicyTenureRulesRoutes = new TimeOffPolicyTenureRulesRoutes();
