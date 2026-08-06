import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { departmentsRoutes } from "@/api/modules/departments/routes/departmentsRoutes";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return departmentsRoutes.exportTree(req, id);
});
