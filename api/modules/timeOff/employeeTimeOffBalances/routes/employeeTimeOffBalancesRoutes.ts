import { hrisEmployeeTimeOffBalancesService } from "@/api/modules/timeOff/employeeTimeOffBalances/services";

export class EmployeeTimeOffBalancesRoutes {
  public async create(req: Request) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisEmployeeTimeOffBalancesService.create({
      assignmentId: body.assignmentId,
      year: body.year,
      openingBalance: body.openingBalance ?? 0,
      accruedBalance: body.accruedBalance ?? 0,
      carriedOverBalance: body.carriedOverBalance ?? 0,
      adjustedBalance: body.adjustedBalance ?? 0,
    });

    return Response.json(data);
  }

  public async getById(_req: Request, id: string) {
    const data = await hrisEmployeeTimeOffBalancesService.getById(id);
    return Response.json(data);
  }

  public async listByUserId(_req: Request, userId: string) {
    const data =
      await hrisEmployeeTimeOffBalancesService.listByUserId(userId);
    return Response.json(data);
  }

  public async adjust(req: Request, id: string) {
    const body = await req.json().catch(() => ({}));

    const data = await hrisEmployeeTimeOffBalancesService.adjust(id, {
      adjustmentAmount: body.adjustmentAmount,
      reason: body.reason,
    });

    return Response.json(data);
  }

  public async listAdjustments(_req: Request, id: string) {
    const data =
      await hrisEmployeeTimeOffBalancesService.listAdjustments(id);
    return Response.json(data);
  }
}

export const employeeTimeOffBalancesRoutes =
  new EmployeeTimeOffBalancesRoutes();