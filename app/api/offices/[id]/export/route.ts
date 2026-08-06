import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { officeRoutes } from "@/api/modules/office/routes/officeRoutes";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return officeRoutes.exportOffice(req, id);
});
