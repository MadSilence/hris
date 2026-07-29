import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { documentsRoutes } from "@/api/modules/documents/routes/documentsRoutes";

type RouteContext = { params: Promise<{ userId: string }> };

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { userId } = await context.params;
  return documentsRoutes.getRootDocuments(req, userId);
});
