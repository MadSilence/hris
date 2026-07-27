import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { departmentsRoutes } from "@/api/modules/departments/routes";

type RouteContext = { params: Promise<{ id: string }> };

export const POST = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return departmentsRoutes.setLead(req, id);
});
