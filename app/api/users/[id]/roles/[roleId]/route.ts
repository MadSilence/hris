import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { hrisUserRolesService } from "@/api/modules/roles/services/hrisUserRolesService/hrisUserRolesService";

type RouteContext = { params: Promise<{ id: string; roleId: string }> };

export const POST = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id, roleId } = await context.params;
  await hrisUserRolesService.assignRole(id, roleId);

  return new Response(null, { status: 204 });
});

export const DELETE = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id, roleId } = await context.params;
  await hrisUserRolesService.removeRole(id, roleId);

  return new Response(null, { status: 204 });
});
