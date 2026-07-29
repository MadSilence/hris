import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { documentsRoutes } from "@/api/modules/documents/routes/documentsRoutes";

type RouteContext = { params: Promise<{ documentId: string }> };

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { documentId } = await context.params;
  return documentsRoutes.downloadDocument(req, documentId);
});
