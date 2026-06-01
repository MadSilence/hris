import { hrisTimeOffPolicyAssignmentsService } from "@/api/modules/timeOff/timeOffPolicyAssignments/services";

export class TimeOffPolicyAssignmentsRoutes {
  public async listByPolicyId(_req: Request, policyId: string) {
    const data =
      await hrisTimeOffPolicyAssignmentsService.listByPolicyId(policyId);
    return Response.json(data);
  }

  public async create(req: Request, policyId: string) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisTimeOffPolicyAssignmentsService.create(policyId, {
      userId: body.userId,
      effectiveFrom: body.effectiveFrom,
      effectiveTo: body.effectiveTo ?? null,
    });

    return Response.json(data);
  }

  public async end(req: Request, assignmentId: string) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisTimeOffPolicyAssignmentsService.end(assignmentId, {
      effectiveTo: body.effectiveTo ?? null,
    });

    return Response.json(data);
  }
}

export const timeOffPolicyAssignmentsRoutes =
  new TimeOffPolicyAssignmentsRoutes();