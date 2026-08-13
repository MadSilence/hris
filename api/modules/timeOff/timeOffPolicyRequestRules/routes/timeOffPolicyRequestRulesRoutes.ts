import { hrisTimeOffPolicyRequestRulesService } from "@/api/modules/timeOff/timeOffPolicyRequestRules/services";

export class TimeOffPolicyRequestRulesRoutes {
  public async getByPolicyId(_req: Request, policyId: string) {
    const data = await hrisTimeOffPolicyRequestRulesService.getByPolicyId(policyId);
    return Response.json(data);
  }
}

export const timeOffPolicyRequestRulesRoutes =
  new TimeOffPolicyRequestRulesRoutes();
