import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { departmentsRoutes } from "@/api/modules/departments/routes";

type RouteContext = { params: Promise<{ id: string; userId: string }> };

export const DELETE = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id, userId } = await context.params;
  return departmentsRoutes.removeMember(req, id, userId);
});
