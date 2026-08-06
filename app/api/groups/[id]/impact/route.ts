import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { groupsRoutes } from "@/api/modules/groups/routes/groupsRoutes/groupsRoutes";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return groupsRoutes.getGroupImpact(id);
});
