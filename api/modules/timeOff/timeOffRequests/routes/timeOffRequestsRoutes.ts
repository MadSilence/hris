import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";

export class TimeOffRequestsRoutes {
  public async create(req: Request) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisTimeOffRequestsService.create({
      assignmentId: body.assignmentId,
      startDate: body.startDate,
      endDate: body.endDate,
      reason: body.reason ?? null,
    });

    return Response.json(data);
  }

  public async previewDuration(req: Request) {
    const url = new URL(req.url);
    const data = await hrisTimeOffRequestsService.previewDuration(
      url.searchParams.get("assignmentId") ?? "",
      url.searchParams.get("startDate") ?? "",
      url.searchParams.get("endDate") ?? ""
    );
    return Response.json(data);
  }

  public async listOverlaps(req: Request) {
    const url = new URL(req.url);
    const data = await hrisTimeOffRequestsService.listOverlaps(
      url.searchParams.get("userId") ?? "",
      url.searchParams.get("startDate") ?? "",
      url.searchParams.get("endDate") ?? ""
    );
    return Response.json(data);
  }

  public async getById(_req: Request, id: string) {
    const data = await hrisTimeOffRequestsService.getById(id);
    return Response.json(data);
  }

  public async listByUserId(_req: Request, userId: string) {
    const data = await hrisTimeOffRequestsService.listByUserId(userId);
    return Response.json(data);
  }

  public async cancel(req: Request, id: string) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisTimeOffRequestsService.cancel(id, {
      cancellationReason: body.cancellationReason ?? null,
    });

    return Response.json(data);
  }

  public async approve(_req: Request, id: string) {
    const data = await hrisTimeOffRequestsService.approve(id);
    return Response.json(data);
  }

  public async reject(req: Request, id: string) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisTimeOffRequestsService.reject(id, {
      rejectionReason: body.rejectionReason,
    });

    return Response.json(data);
  }
}

export const timeOffRequestsRoutes = new TimeOffRequestsRoutes();