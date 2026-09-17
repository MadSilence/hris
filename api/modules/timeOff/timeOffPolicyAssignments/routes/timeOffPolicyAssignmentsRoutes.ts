import { hrisTimeOffPolicyAssignmentsService } from "@/api/modules/timeOff/timeOffPolicyAssignments/services";

// Mutations go through server actions; reads go through these methods only where a route handler exists.
export class TimeOffPolicyAssignmentsRoutes {
  public async listByPolicyId(_req: Request, policyId: string) {
    const data =
      await hrisTimeOffPolicyAssignmentsService.listByPolicyId(policyId);
    return Response.json(data);
  }

  public async impact(req: Request, policyId: string) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisTimeOffPolicyAssignmentsService.impact(
      policyId,
      Array.isArray(body.userIds) ? body.userIds : []
    );

    return Response.json(data);
  }
}

export const timeOffPolicyAssignmentsRoutes =
  new TimeOffPolicyAssignmentsRoutes();