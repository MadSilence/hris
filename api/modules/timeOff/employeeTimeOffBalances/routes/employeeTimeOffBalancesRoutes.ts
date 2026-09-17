import { hrisEmployeeTimeOffBalancesService } from "@/api/modules/timeOff/employeeTimeOffBalances/services";

// Mutations go through server actions; reads go through these methods only where a route handler exists.
export class EmployeeTimeOffBalancesRoutes {
  public async getById(_req: Request, id: string) {
    const data = await hrisEmployeeTimeOffBalancesService.getById(id);
    return Response.json(data);
  }

  public async listByUserId(_req: Request, userId: string) {
    const data =
      await hrisEmployeeTimeOffBalancesService.listByUserId(userId);
    return Response.json(data);
  }

  public async balanceAsOf(req: Request, id: string) {
    const date = new URL(req.url).searchParams.get("date") ?? "";
    const data = await hrisEmployeeTimeOffBalancesService.balanceAsOf(id, date);
    return Response.json(data);
  }

  public async listTransactions(_req: Request, id: string) {
    const data =
      await hrisEmployeeTimeOffBalancesService.listTransactions(id);
    return Response.json(data);
  }
}

export const employeeTimeOffBalancesRoutes =
  new EmployeeTimeOffBalancesRoutes();