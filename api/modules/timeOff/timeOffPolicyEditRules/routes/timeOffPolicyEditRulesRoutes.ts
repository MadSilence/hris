import { hrisTimeOffPolicyEditRulesService } from "@/api/modules/timeOff/timeOffPolicyEditRules/services";

export class TimeOffPolicyEditRulesRoutes {
  public async getByPolicyId(_req: Request, policyId: string) {
    const data = await hrisTimeOffPolicyEditRulesService.getByPolicyId(policyId);
    return Response.json(data);
  }
}

export const timeOffPolicyEditRulesRoutes = new TimeOffPolicyEditRulesRoutes();
