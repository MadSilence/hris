import { hrisTimeOffPolicyBlackoutsService } from "@/api/modules/timeOff/timeOffPolicyBlackouts/services";

export class TimeOffPolicyBlackoutsRoutes {
  public async getByPolicyId(_req: Request, policyId: string) {
    const data = await hrisTimeOffPolicyBlackoutsService.getByPolicyId(policyId);
    return Response.json(data);
  }
}

export const timeOffPolicyBlackoutsRoutes = new TimeOffPolicyBlackoutsRoutes();
