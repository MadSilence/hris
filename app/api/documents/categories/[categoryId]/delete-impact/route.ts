import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { documentsRoutes } from "@/api/modules/documents/routes/documentsRoutes";

type RouteContext = { params: Promise<{ categoryId: string }> };

/** "{n} documents have this category" (AQ-19). */
export const GET = apiRequestWrapper(async (_req: Request, context: RouteContext) => {
  const { categoryId } = await context.params;
  return documentsRoutes.getCategoryDeleteImpact(categoryId);
});
