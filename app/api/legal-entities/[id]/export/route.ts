import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { legalEntityRoutes } from "@/api/modules/legalEntity/routes/legalEntityRoutes";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return legalEntityRoutes.exportLegalEntity(req, id);
});
