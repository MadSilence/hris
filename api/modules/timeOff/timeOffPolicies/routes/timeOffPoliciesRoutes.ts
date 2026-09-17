import { hrisTimeOffPoliciesService } from "@/api/modules/timeOff/timeOffPolicies/services/";

// Mutations go through server actions; reads go through these methods only where a route handler exists.
export class TimeOffPoliciesRoutes {
  public async list(_req: Request) {
    const data = await hrisTimeOffPoliciesService.list();
    return Response.json(data);
  }

  public async exportPolicies(req: Request) {
    const url = new URL(req.url);
    const format = url.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";
    const backendResponse = await hrisTimeOffPoliciesService.exportPolicies(format);
    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: {
        "Content-Type":
          backendResponse.headers.get("content-type") ?? "application/octet-stream",
        "Content-Disposition":
          backendResponse.headers.get("content-disposition") ?? "attachment",
      },
    });
  }

  public async editImpact(_req: Request, id: string) {
    const data = await hrisTimeOffPoliciesService.editImpact(id);
    return Response.json(data);
  }

  public async getById(_req: Request, id: string) {
    const data = await hrisTimeOffPoliciesService.getById(id);
    return Response.json(data);
  }
}

export const timeOffPoliciesRoutes = new TimeOffPoliciesRoutes();