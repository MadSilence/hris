import { hrisDepartmentsService } from "@/api/modules/departments/services";

export class DepartmentsRoutes {
  public async list(_req: Request) {
    const data = await hrisDepartmentsService.list();
    return Response.json(data);
  }

  public async tree(req: Request) {
    const url = new URL(req.url);
    const nested = url.searchParams.get("nested") !== "false";
    const includeArchived = url.searchParams.get("includeArchived") === "true";
    const data = await hrisDepartmentsService.tree(nested, includeArchived);
    return Response.json(data);
  }

  public async getById(_req: Request, id: string) {
    const data = await hrisDepartmentsService.getById(id);
    return Response.json(data);
  }

  public async create(req: Request) {
    const body = await req.json().catch(() => ({}));
    const data = await hrisDepartmentsService.create({
      name: body.name,
      description: body.description ?? null,
      code: body.code ?? null,
      parentId: body.parentId ?? null,
    });
    return Response.json(data, { status: 201 });
  }

  public async update(req: Request, id: string) {
    const body = await req.json().catch(() => ({}));
    const data = await hrisDepartmentsService.update(id, {
      name: body.name,
      description: body.description ?? null,
      code: body.code ?? null,
      parentId: body.parentId ?? null,
    });
    return Response.json(data);
  }

  public async archive(_req: Request, id: string) {
    const data = await hrisDepartmentsService.archive(id);
    return Response.json(data);
  }

  public async activate(_req: Request, id: string) {
    const data = await hrisDepartmentsService.activate(id);
    return Response.json(data);
  }

  public async delete(req: Request, id: string) {
    const body = await req.json().catch(() => ({}));
    await hrisDepartmentsService.delete(id, {
      childrenStrategy: body.childrenStrategy,
      membersStrategy: body.membersStrategy,
      targetId: body.targetId ?? null,
    });
    return new Response(null, { status: 204 });
  }
}

export const departmentsRoutes = new DepartmentsRoutes();
