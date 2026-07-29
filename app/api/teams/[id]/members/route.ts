import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { teamsRoutes } from "@/api/modules/teams/routes";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return teamsRoutes.getMembers(req, id);
});
