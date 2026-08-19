import { hrisTeamsService } from "@/api/modules/teams/services";

export class TeamsRoutes {
  public async list(_req: Request) {
    const data = await hrisTeamsService.list();
    return Response.json(data);
  }

  public async tree(req: Request) {
    const url = new URL(req.url);
    const nested = url.searchParams.get("nested") !== "false";
    const includeArchived = url.searchParams.get("includeArchived") === "true";
    const data = await hrisTeamsService.tree(nested, includeArchived);
    return Response.json(data);
  }

  public async people(req: Request) {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? undefined;
    const data = await hrisTeamsService.people(q);
    return Response.json(data);
  }

  public async summary(req: Request) {
    const url = new URL(req.url);
    const includeArchived = url.searchParams.get("includeArchived") === "true";
    const data = await hrisTeamsService.summary(includeArchived);
    return Response.json(data);
  }

  public async getById(_req: Request, id: string) {
    const data = await hrisTeamsService.getById(id);
    return Response.json(data);
  }

  public async exportTree(req: Request, id: string) {
    const url = new URL(req.url);
    const backendResponse = await hrisTeamsService.exportTree(id, {
      format: url.searchParams.get("format") === "csv" ? "csv" : "xlsx",
      includeSubNodes: url.searchParams.get("includeSubNodes") === "true",
      includePeople: url.searchParams.get("includePeople") === "true",
    });
    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: {
        "Content-Type": backendResponse.headers.get("content-type") ?? "application/octet-stream",
        "Content-Disposition": backendResponse.headers.get("content-disposition") ?? "attachment",
      },
    });
  }
}

export const teamsRoutes = new TeamsRoutes();
