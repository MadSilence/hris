import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { departmentsRoutes } from "@/api/modules/departments/routes";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return departmentsRoutes.getById(req, id);
});

export const PATCH = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return departmentsRoutes.update(req, id);
});
