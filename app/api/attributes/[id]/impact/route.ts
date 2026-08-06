import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { attributesRoutes } from "@/api/modules/attributes/routes/attributesRoutes";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { id } = await context.params;
  return attributesRoutes.getImpact(id);
});
