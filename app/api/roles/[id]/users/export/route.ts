import { NextRequest } from "next/server";
import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { roleRoutes } from "@/api/modules/roles/routes/roleRoutes";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (req: NextRequest, context: RouteContext) => {
  const { id } = await context.params;

  return roleRoutes.exportRoleUsers(req, id);
});
