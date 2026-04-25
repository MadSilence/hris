import { documentsRoutes } from "@/api/modules/documents/routes/documentsRoutes";

export async function POST(
  req: Request,
  context: { params: Promise<{ userId: string; folderId: string }> }
) {
  const { userId, folderId } = await context.params;
  return documentsRoutes.deleteFolder(req, userId, folderId);
}
