import { hrisLeaveTypesService } from "@/api/modules/timeOff/leaveTypes/services/";

export class LeaveTypesRoutes {
  public async list(req: Request) {
    const url = new URL(req.url);
    const includeArchived = url.searchParams.get("includeArchived") !== "false";
    const data = await hrisLeaveTypesService.list(includeArchived);
    return Response.json(data);
  }

  public async getById(_req: Request, id: string) {
    const data = await hrisLeaveTypesService.getById(id);
    return Response.json(data);
  }
}

export const leaveTypesRoutes = new LeaveTypesRoutes();
