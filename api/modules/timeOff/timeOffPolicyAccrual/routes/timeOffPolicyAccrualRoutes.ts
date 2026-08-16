import { hrisTimeOffPolicyAccrualService } from "@/api/modules/timeOff/timeOffPolicyAccrual/services";

export class TimeOffPolicyAccrualRoutes {
  public async getByPolicyId(_req: Request, policyId: string) {
    const data = await hrisTimeOffPolicyAccrualService.getByPolicyId(policyId);
    return Response.json(data);
  }
}

export const timeOffPolicyAccrualRoutes = new TimeOffPolicyAccrualRoutes();
