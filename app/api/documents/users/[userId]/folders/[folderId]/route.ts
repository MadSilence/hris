import { documentsRoutes } from "@/api/modules/documents/routes/documentsRoutes";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ userId: string; folderId: string }> }
) {
  const { userId, folderId } = await context.params;
  return documentsRoutes.renameFolder(req, userId, folderId);
}
