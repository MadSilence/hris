import { apiRequestWrapper } from "@/api/utils/apiRequestWrapper";
import { documentsRoutes } from "@/api/modules/documents/routes/documentsRoutes";

type RouteContext = { params: Promise<{ userId: string; folderId: string }> };

export const GET = apiRequestWrapper(async (req: Request, context: RouteContext) => {
  const { userId, folderId } = await context.params;
  return documentsRoutes.getFolderContent(req, userId, folderId);
});
