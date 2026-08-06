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

  public async getById(_req: Request, id: string) {
    const data = await hrisTeamsService.getById(id);
    return Response.json(data);
  }

  public async create(req: Request) {
    const body = await req.json().catch(() => ({}));
    const data = await hrisTeamsService.create({
      name: body.name,
      description: body.description ?? null,
      code: body.code ?? null,
      parentId: body.parentId ?? null,
    });
    return Response.json(data, { status: 201 });
  }

  public async update(req: Request, id: string) {
    const body = await req.json().catch(() => ({}));
    const data = await hrisTeamsService.update(id, {
      name: body.name,
      description: body.description ?? null,
      code: body.code ?? null,
      parentId: body.parentId ?? null,
    });
    return Response.json(data);
  }

  public async archive(_req: Request, id: string) {
    const data = await hrisTeamsService.archive(id);
    return Response.json(data);
  }

  public async activate(_req: Request, id: string) {
    const data = await hrisTeamsService.activate(id);
    return Response.json(data);
  }

  public async delete(req: Request, id: string) {
    const body = await req.json().catch(() => ({}));
    await hrisTeamsService.delete(id, {
      childrenStrategy: body.childrenStrategy,
      membersStrategy: body.membersStrategy,
      subMembersStrategy: body.subMembersStrategy,
      targetId: body.targetId ?? null,
    });
    return new Response(null, { status: 204 });
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
