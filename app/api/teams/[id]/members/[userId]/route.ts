import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { teamsRoutes } from "@/api/modules/teams/routes";

type RouteContext = { params: Promise<{ id: string; userId: string }> };

export const DELETE = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id, userId } = await context.params;
  return teamsRoutes.removeMember(req, id, userId);
});
