import { hrisTimeOffRequestsService } from "@/api/modules/timeOff/timeOffRequests/services";

// Mutations go through server actions; reads go through these methods only where a route handler exists.
export class TimeOffRequestsRoutes {
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

  public async listAwaitingMe(_req: Request) {
    const data = await hrisTimeOffRequestsService.listAwaitingMe();
    return Response.json(data);
  }

  public async listByUserId(req: Request, userId: string) {
    const params = new URL(req.url).searchParams;
    const yearParam = params.get("year");
    const data = await hrisTimeOffRequestsService.listByUserId(userId, {
      year: yearParam ? Number(yearParam) : null,
      status: params.get("status"),
    });
    return Response.json(data);
  }
}

export const timeOffRequestsRoutes = new TimeOffRequestsRoutes();